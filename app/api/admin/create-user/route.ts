import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Verify caller is PLATFORM_ADMIN
    const { data: callerRecord } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerRecord?.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      // User fields
      name, email, password, phone_number, role,
      // Organization fields (for RESELLER / DISTRIBUTOR)
      org_name, org_legal_name, org_type, org_industry, org_company_size,
      org_year_established, org_website, org_description,
      org_country, org_city, org_state, org_postal_code,
      org_phone, org_support_email, org_sales_email,
      org_verified,
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'name, email, password and role are required' }, { status: 400 });
    }

    // 1. Create Supabase Auth user (email already confirmed — no verification email)
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const newUserId = authData.user!.id;

    // 2. Create organization (RESELLER / DISTRIBUTOR always; END_USER only if org_name provided)
    let organizationId: string | null = null;
    if (role === 'END_USER' && org_name) {
      const buyerOrgName = org_name.trim();
      const { data: createdOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert([{
          name: buyerOrgName,
          legal_name: org_legal_name?.trim() || buyerOrgName,
          type: 'BUYER',
          verified: false,
          is_verified: false,
        }])
        .select()
        .single();

      if (orgError) {
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        return NextResponse.json({ error: 'Failed to create buyer organization: ' + orgError.message }, { status: 400 });
      }
      organizationId = createdOrg.id;
    }

    if (role === 'RESELLER' || role === 'DISTRIBUTOR') {
      const orgPayload: Record<string, any> = {
        name: org_name || `${name}'s Company`,
        legal_name: org_legal_name || `${name}'s Company Inc.`,
        type: org_type || role,
        description: org_description || 'New organization',
        industry: org_industry || 'Technology',
        company_size: org_company_size || '1-10',
        year_established: org_year_established || new Date().getFullYear(),
        verified: org_verified ?? false,
        rating: 0,
        review_count: 0,
      };
      // Optional fields — use correct schema column names
      if (org_website)       orgPayload.website               = org_website;
      if (org_country)       orgPayload.address_country       = org_country;
      if (org_city)          orgPayload.address_city          = org_city;
      if (org_state)         orgPayload.address_state         = org_state;
      if (org_postal_code)   orgPayload.address_postal_code   = org_postal_code;
      if (org_phone)         orgPayload.contact_phone         = org_phone;
      if (org_support_email) orgPayload.contact_support_email = org_support_email;
      if (org_sales_email)   orgPayload.contact_sales_email   = org_sales_email;

      const { data: createdOrg, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert([orgPayload])
        .select()
        .single();

      if (orgError) {
        // Rollback auth user
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        return NextResponse.json({ error: 'Failed to create organization: ' + orgError.message }, { status: 400 });
      }
      organizationId = createdOrg.id;
    }

    // 3. Create user record in public.users table
    const userPayload: Record<string, any> = {
      id: newUserId,
      email,
      name,
      role,
      is_active: true,
      organization_id: organizationId,
    };
    if (phone_number) userPayload.phone_number = phone_number;

    const { error: userError } = await supabaseAdmin.from('users').insert([userPayload]);

    if (userError) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      if (organizationId) await supabaseAdmin.from('organizations').delete().eq('id', organizationId);
      return NextResponse.json({ error: 'Failed to create user record: ' + userError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      userId: newUserId,
      organizationId,
      message: `${role} created successfully`,
    });

  } catch (error) {
    console.error('Admin create-user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

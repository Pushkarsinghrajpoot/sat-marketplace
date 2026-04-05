import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id, role, organization_id')
      .eq('id', caller.id)
      .single();

    if (!dbUser || dbUser.role !== 'END_USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone_number, org_name, org_legal_name } = body;

    // 1. Update user profile
    if (name || phone_number !== undefined) {
      const userUpdate: Record<string, any> = {};
      if (name) userUpdate.name = name.trim();
      if (phone_number !== undefined) userUpdate.phone_number = phone_number?.trim() || null;

      const { error: userErr } = await supabaseAdmin
        .from('users')
        .update(userUpdate)
        .eq('id', caller.id);

      if (userErr) {
        return NextResponse.json({ error: 'Failed to update profile: ' + userErr.message }, { status: 400 });
      }
    }

    // 2. Update or create organization
    if (org_name) {
      const trimmedName = org_name.trim();

      if (dbUser.organization_id) {
        // Update existing org
        const { error: orgErr } = await supabaseAdmin
          .from('organizations')
          .update({
            name: trimmedName,
            legal_name: org_legal_name?.trim() || trimmedName,
          })
          .eq('id', dbUser.organization_id);

        if (orgErr) {
          return NextResponse.json({ error: 'Failed to update organization: ' + orgErr.message }, { status: 400 });
        }
      } else {
        // Create new BUYER org and link to user
        const { data: newOrg, error: orgErr } = await supabaseAdmin
          .from('organizations')
          .insert([{
            name: trimmedName,
            legal_name: org_legal_name?.trim() || trimmedName,
            type: 'BUYER',
            verified: false,
            is_verified: false,
          }])
          .select('id')
          .single();

        if (orgErr || !newOrg) {
          return NextResponse.json({ error: 'Failed to create organization: ' + orgErr?.message }, { status: 400 });
        }

        const { error: linkErr } = await supabaseAdmin
          .from('users')
          .update({ organization_id: newOrg.id })
          .eq('id', caller.id);

        if (linkErr) {
          return NextResponse.json({ error: 'Failed to link organization: ' + linkErr.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('End-user profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

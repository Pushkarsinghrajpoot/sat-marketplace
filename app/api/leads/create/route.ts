import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

async function assignReseller(): Promise<{ id: string; organization_id: string | null } | null> {
  // Pick the active RESELLER with the fewest assigned leads (round-robin by load)
  const { data: resellers } = await supabaseAdmin
    .from('users')
    .select('id, organization_id')
    .eq('role', 'RESELLER')
    .eq('is_active', true)
    .in('team_role', [null, 'ADMIN']); // include org owners and team admins

  if (!resellers || resellers.length === 0) return null;

  // Count existing open leads per reseller
  const counts = await Promise.all(
    resellers.map(async (r) => {
      const { count } = await supabaseAdmin
        .from('customer_leads')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_reseller_id', r.id)
        .in('status', ['NEW', 'ASSIGNED', 'CONTACTED']);
      return { ...r, load: count ?? 0 };
    })
  );

  counts.sort((a, b) => a.load - b.load);
  return counts[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      product_name,
      buyer_name,
      buyer_email,
      buyer_phone,
      buyer_company,
      inquiry_type = 'QUOTE_REQUEST',
      requirement,
      bulk_quantity = 1,
      budget_range,
      source = 'MARKETPLACE',
    } = body;

    if (!buyer_name || !buyer_email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Optionally link to a registered user account
    let buyer_user_id: string | null = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single();
        if (dbUser && (dbUser.role === 'END_USER')) {
          buyer_user_id = dbUser.id;
        }
      }
    }

    // Auto-assign to the product owner's reseller organization
    let reseller = null;
    
    if (product_id) {
      // Get the product to find its owner organization
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('organization_id')
        .eq('id', product_id)
        .single();
      
      if (product?.organization_id) {
        // Find admin/owner of the product's organization
        const { data: productOwner } = await supabaseAdmin
          .from('users')
          .select('id, organization_id')
          .eq('organization_id', product.organization_id)
          .eq('role', 'RESELLER')
          .eq('is_active', true)
          .in('team_role', [null, 'ADMIN'])
          .limit(1)
          .single();
        
        if (productOwner) {
          reseller = productOwner;
          console.log('Assigned lead to product owner:', productOwner);
        }
      }
    }
    
    // Fallback to round-robin if no specific product owner found
    if (!reseller) {
      reseller = await assignReseller();
      console.log('Used round-robin assignment:', reseller);
    }

    const payload: Record<string, any> = {
      product_id: product_id || null,
      product_name: product_name || null,
      buyer_user_id,
      buyer_name,
      buyer_email,
      buyer_phone: buyer_phone || null,
      buyer_company: buyer_company || null,
      inquiry_type,
      requirement: requirement || null,
      bulk_quantity,
      budget_range: budget_range || null,
      source,
      status: reseller ? 'ASSIGNED' : 'NEW',
      assigned_reseller_id: reseller?.id || null,
      assigned_reseller_org_id: reseller?.organization_id || null,
    };

    const { data: lead, error } = await supabaseAdmin
      .from('customer_leads')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Lead creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Notify all relevant team members of the reseller organization
    if (reseller?.organization_id) {
      // Get all active team members (admins and relevant roles) from the organization
      const { data: teamMembers } = await supabaseAdmin
        .from('users')
        .select('id, name, team_role')
        .eq('organization_id', reseller.organization_id)
        .eq('role', 'RESELLER')
        .eq('is_active', true)
        .in('team_role', [null, 'ADMIN', 'SALES', 'MANAGER']); // Include relevant roles
      
      if (teamMembers && teamMembers.length > 0) {
        // Create notifications for all team members
        const notifications = teamMembers.map(member => ({
          user_id: member.id,
          notification_type: 'NEW_LEAD',
          title: 'New Quote Request',
          message: `${buyer_name}${buyer_company ? ` from ${buyer_company}` : ''} requested a quote${product_name ? ` for ${product_name}` : ''}.`,
          link: '/reseller/inquiries',
          read: false,
        }));
        
        await supabaseAdmin.from('notifications').insert(notifications);
        console.log(`Notified ${teamMembers.length} team members of organization ${reseller.organization_id}`);
      }
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error('Create lead error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

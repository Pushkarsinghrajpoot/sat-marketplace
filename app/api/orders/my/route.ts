import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/orders/my — buyer fetches their own orders (or all org orders if team ADMIN)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id, role, team_role, organization_id')
    .eq('id', user.id)
    .single();
  if (!dbUser || dbUser.role !== 'END_USER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const selectFields = '*, reseller:users!orders_assigned_reseller_id_fkey(id, name, email, phone_number), reseller_org:organizations!orders_reseller_org_id_fkey(id, name, logo), buyer:users!orders_buyer_user_id_fkey(id, name, email)';

  const isTeamAdmin = dbUser.team_role === 'ADMIN' && dbUser.organization_id;

  let query;

  if (isTeamAdmin) {
    // Fetch all org members' IDs first
    const { data: orgMembers } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('organization_id', dbUser.organization_id)
      .eq('role', 'END_USER');

    const memberIds = (orgMembers || []).map((m: { id: string }) => m.id);
    if (memberIds.length === 0) memberIds.push(dbUser.id);

    query = supabaseAdmin
      .from('orders')
      .select(selectFields)
      .in('buyer_user_id', memberIds)
      .order('created_at', { ascending: false });
  } else {
    query = supabaseAdmin
      .from('orders')
      .select(selectFields)
      .eq('buyer_user_id', dbUser.id)
      .order('created_at', { ascending: false });
  }

  if (status && status !== 'ALL') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data || [], isTeamAdmin });
}

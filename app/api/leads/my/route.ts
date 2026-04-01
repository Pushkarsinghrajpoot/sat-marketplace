import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/leads/my — end-user fetches their own leads (matched by email or user_id)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (!dbUser || dbUser.role !== 'END_USER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch leads where buyer_user_id matches OR buyer_email matches (catches pre-account leads)
  const { data, error } = await supabaseAdmin
    .from('customer_leads')
    .select('*, products(id, name, sku, price), reseller:users!customer_leads_assigned_reseller_id_fkey(id, name, email, phone_number), reseller_org:organizations!customer_leads_assigned_reseller_org_id_fkey(id, name, logo)')
    .or(`buyer_user_id.eq.${dbUser.id},buyer_email.eq.${dbUser.email}`)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ leads: data || [] });
}

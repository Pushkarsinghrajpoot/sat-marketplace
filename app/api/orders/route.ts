import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin.from('users').select('id, role').eq('id', user.id).single();
  return data;
}

// GET /api/orders — reseller fetches their orders
export async function GET(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'RESELLER' && caller.role !== 'PLATFORM_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (caller.role === 'RESELLER') {
    query = query.eq('assigned_reseller_id', caller.id);
  }
  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data || [] });
}

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

// GET /api/notifications — fetch current user's notifications
export async function GET(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', caller.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ notifications: data || [] });
}

// PATCH /api/notifications — mark one or all as read
export async function PATCH(request: NextRequest) {
  const caller = await getUser(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, all } = await request.json();

  if (all) {
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', caller.id)
      .eq('read', false);
  } else if (id) {
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', caller.id);
  }

  return NextResponse.json({ success: true });
}

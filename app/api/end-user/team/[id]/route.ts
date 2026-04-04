import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getCaller(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, role, team_role, organization_id')
    .eq('id', user.id)
    .single();
  return data;
}

// PATCH /api/end-user/team/[id] — update team member role or status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'END_USER' || caller.team_role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only team admins can update members' }, { status: 403 });
  }

  const { teamRole, is_active } = await request.json();

  const { data: target } = await supabaseAdmin
    .from('users')
    .select('id, organization_id')
    .eq('id', id)
    .single();

  if (!target || target.organization_id !== caller.organization_id) {
    return NextResponse.json({ error: 'Member not found in your organization' }, { status: 404 });
  }

  if (target.id === caller.id) {
    return NextResponse.json({ error: 'Cannot modify your own account via team management' }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (teamRole !== undefined) updates.team_role = teamRole;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data: updated, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, name, email, team_role, is_active')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ member: updated });
}

// DELETE /api/end-user/team/[id] — deactivate team member
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'END_USER' || caller.team_role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only team admins can remove members' }, { status: 403 });
  }

  const { data: target } = await supabaseAdmin
    .from('users')
    .select('id, organization_id')
    .eq('id', id)
    .single();

  if (!target || target.organization_id !== caller.organization_id) {
    return NextResponse.json({ error: 'Member not found in your organization' }, { status: 404 });
  }

  if (target.id === caller.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
  }

  await supabaseAdmin.from('users').update({ is_active: false }).eq('id', id);
  return NextResponse.json({ success: true });
}

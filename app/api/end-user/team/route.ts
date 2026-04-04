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
    .select('id, role, name, email, organization_id, team_role')
    .eq('id', user.id)
    .single();
  return data;
}

// Ensure the end-user has a BUYER org; create one if they don't
async function ensureBuyerOrg(caller: { id: string; name: string; email: string; organization_id: string | null }): Promise<string> {
  if (caller.organization_id) {
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, type')
      .eq('id', caller.organization_id)
      .single();
    if (org?.type === 'BUYER') return org.id;
  }

  // Create a new BUYER org for this user
  const orgName = `${caller.name}'s Company`;
  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .insert({
      name: orgName,
      legal_name: orgName,
      type: 'BUYER',
      verified: false,
      is_verified: false,
    })
    .select('id')
    .single();

  if (error || !org) {
    console.error('Failed to create buyer org:', error?.message, error?.details, error?.hint);
    throw new Error(`Failed to create buyer organization: ${error?.message || 'unknown error'}`);
  }

  // Link caller to this org as ADMIN
  await supabaseAdmin
    .from('users')
    .update({ organization_id: org.id, team_role: 'ADMIN' })
    .eq('id', caller.id);

  return org.id;
}

// GET /api/end-user/team — list team members
export async function GET(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'END_USER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!caller.organization_id) {
    return NextResponse.json({ members: [], orgExists: false });
  }

  // Only return team members if their org is a BUYER org
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id, name, type')
    .eq('id', caller.organization_id)
    .single();

  if (!org || org.type !== 'BUYER') {
    return NextResponse.json({ members: [], orgExists: false });
  }

  const { data: members } = await supabaseAdmin
    .from('users')
    .select('id, name, email, team_role, is_active, created_at, phone_number')
    .eq('organization_id', caller.organization_id)
    .eq('role', 'END_USER')
    .order('created_at', { ascending: true });

  return NextResponse.json({ members: members || [], orgExists: true, org });
}

// POST /api/end-user/team — create new team member directly
export async function POST(request: NextRequest) {
  const caller = await getCaller(request);
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (caller.role !== 'END_USER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (caller.team_role && caller.team_role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only team admins can invite members' }, { status: 403 });
  }

  const { email, name, password, teamRole, phone_number } = await request.json();
  if (!email || !name || !password || !teamRole) {
    return NextResponse.json({ error: 'email, name, password, teamRole are required' }, { status: 400 });
  }

  const validRoles = ['ADMIN', 'PURCHASER', 'APPROVER', 'VIEWER'];
  if (!validRoles.includes(teamRole)) {
    return NextResponse.json({ error: 'Invalid team role' }, { status: 400 });
  }

  // Ensure caller has a BUYER org
  const orgId = await ensureBuyerOrg(caller as any);

  // Check email not already in use
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (existing) return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });

  // Create auth user
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create account' }, { status: 400 });
  }

  // Create users table record
  const { data: newUser, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUser.user.id,
      email: email.toLowerCase(),
      name,
      role: 'END_USER',
      team_role: teamRole,
      organization_id: orgId,
      invited_by: caller.id,
      invitation_status: 'ACTIVE',
      is_active: true,
      phone_number: phone_number || null,
    })
    .select('id, name, email, team_role, is_active, created_at')
    .single();

  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  return NextResponse.json({ member: newUser }, { status: 201 });
}

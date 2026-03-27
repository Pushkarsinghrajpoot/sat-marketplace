import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, teamRole, organizationId, createdBy, permissions } = body;

    if (!email || !password || !name || !organizationId || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create auth account with admin API - email confirmed by default, no verification email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
      }
    });

    if (authError) {
      console.error('Auth error creating user:', authError);
      return NextResponse.json(
        { error: 'Failed to create auth account', details: authError.message },
        { status: 400 }
      );
    }

    // Create user record
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user!.id,
        email,
        name,
        role: role || 'RESELLER',
        team_role: teamRole || 'MEMBER',
        permissions: permissions || {},
        organization_id: organizationId,
        invited_by: createdBy,
        invitation_status: 'ACTIVE',
      });

    if (userError) {
      console.error('Database error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user record', details: userError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      userId: authData.user!.id,
      message: 'Team member created successfully'
    });

  } catch (error) {
    console.error('API error creating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

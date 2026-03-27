import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from the request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user is authenticated and has permission
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, password, name, role, teamRole, organizationId, createdBy, permissions } = body;

    if (!email || !password || !name || !organizationId || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the user has permission to create team members for this organization
    if (createdBy !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    console.log('Creating team member:', { email, name, organizationId, createdBy });

    // Create auth account with admin API using service role key
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This should prevent verification email
      user_metadata: {
        name,
      },
      email: email, // Explicitly set email
    });

    if (createUserError) {
      console.error('Auth error creating user:', createUserError);
      return NextResponse.json(
        { error: 'Failed to create auth account', details: createUserError.message },
        { status: 400 }
      );
    }

    console.log('Auth user created:', authData.user!.id);

    // Create user record in database
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

    console.log('Team member creation completed:', authData.user!.id);

    return NextResponse.json({ 
      success: true, 
      userId: authData.user!.id,
      message: 'Team member created successfully'
    });

  } catch (error) {
    console.error('API error creating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

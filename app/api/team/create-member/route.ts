import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      }
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

    // Send welcome email directly with Resend
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'onboarding@yourdomain.com',
        to: [email],
        subject: 'Welcome to the Team! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8fafc; padding: 40px; border-radius: 8px;">
              <h1 style="color: #1e293b; margin-bottom: 20px;">Welcome to the Team, ${name}!</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                Your account has been created successfully. You can now login and start collaborating with your team.
              </p>
              
              <div style="background-color: #e2e8f0; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-bottom: 10px;">Your Login Details:</h3>
                <p style="color: #475569; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="color: #475569; margin: 5px 0;"><strong>Password:</strong> [The password set by your admin]</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href='${"https://sat-marketplace-b588.vercel.app"}/auth/login' 
                   style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
                If you have any questions, please contact your team administrator.
              </p>
            </div>
          </div>
        `,
      });

      if (emailError) {
        console.warn('Failed to send welcome email:', emailError);
        // Continue anyway - user was created successfully
      } else {
        console.log('Welcome email sent successfully:', emailData);
      }
    } catch (emailError) {
      console.warn('Email sending failed:', emailError);
      // Continue anyway - user was created successfully
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

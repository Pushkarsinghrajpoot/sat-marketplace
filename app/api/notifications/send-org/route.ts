import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendNotificationWithEmail } from '@/lib/notification-with-email';

/**
 * POST /api/notifications/send-org
 * Send a notification to all users in an organization with a specific role.
 * Uses the admin client (service role) to bypass RLS for user lookup.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, role, notificationType, title, message, link, emailData } = body;

    if (!organizationId || !notificationType || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, notificationType, title, message' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS and find all users in the target org
    let query = supabaseAdmin
      .from('users')
      .select('id')
      .eq('organization_id', organizationId);

    if (role) {
      query = query.eq('role', role);
    }

    const { data: orgUsers, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching org users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    if (!orgUsers || orgUsers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No users found in organization' });
    }

    // Send notification to each user
    const results = await Promise.allSettled(
      orgUsers.map((u: { id: string }) =>
        sendNotificationWithEmail({
          userId: u.id,
          notificationType,
          title,
          message,
          link,
          emailData,
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ success: true, sent: successful, failed });
  } catch (error) {
    console.error('API error in send-org notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

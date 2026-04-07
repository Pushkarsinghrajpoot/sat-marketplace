/**
 * Client-safe notification functions that call server-side API
 * Use these in client components instead of importing sendNotificationWithEmail directly
 */

interface NotificationParams {
  userId: string;
  notificationType: string;
  title: string;
  message: string;
  link: string;
  emailData?: any;
}

export async function sendNotification(params: NotificationParams) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send notification');
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
}

/**
 * Send a notification to all users in an organization (server resolves users via admin client,
 * bypassing RLS so cross-org lookups work correctly).
 */
export async function sendOrgNotification(
  organizationId: string,
  role: string | null,
  notificationType: string,
  title: string,
  message: string,
  link: string,
  emailData?: any
) {
  try {
    const response = await fetch('/api/notifications/send-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, role, notificationType, title, message, link, emailData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send org notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending org notification:', error);
    return { success: false, error };
  }
}

export async function sendBulkNotification(
  userIds: string[],
  notificationType: string,
  title: string,
  message: string,
  link: string,
  emailData?: any
) {
  const results = await Promise.allSettled(
    userIds.map(userId =>
      sendNotification({
        userId,
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

  return { successful, failed, results };
}

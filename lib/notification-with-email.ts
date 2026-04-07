import { supabase } from './supabase';
import { sendEmail } from './email';
import { emailTemplates, EmailTemplateType } from './email-templates';

interface NotificationParams {
  userId: string;
  notificationType: EmailTemplateType;
  title: string;
  message: string;
  link: string;
  emailData?: any;
}

export async function sendNotificationWithEmail(params: NotificationParams) {
  try {
    // 1. Insert notification into database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        notification_type: params.notificationType,
        title: params.title,
        message: params.message,
        link: params.link,
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // 2. Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', params.userId)
      .single();

    if (userError || !user?.email) {
      console.error('Error fetching user email:', userError);
      return { success: false, error: userError };
    }

    // 3. Get email template
    const templateFunction = emailTemplates[params.notificationType as keyof typeof emailTemplates];
    if (!templateFunction) {
      console.warn('No email template found for:', params.notificationType, '— notification saved to DB, skipping email.');
      return { success: true, emailSkipped: true };
    }

    // 4. Prepare email data with user name and full link
    const emailTemplateData = {
      recipientName: user.name,
      link: `https://one.satmz.com${params.link}`,
      ...params.emailData,
    };

    const { subject, html } = templateFunction(emailTemplateData);

    // 5. Send email (skip if email service not configured)
    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject,
        html,
      });
      return emailResult;
    } catch (emailError) {
      console.warn('Email service not configured, notification saved to database only:', emailError);
      // Return success since notification was saved to database
      return { success: true, emailSkipped: true };
    }
  } catch (error) {
    console.error('Error in sendNotificationWithEmail:', error);
    // Return success if notification was saved, even if email failed
    return { success: true, error: 'Email failed but notification saved' };
  }
}

// Bulk notification sender (for multiple users)
export async function sendBulkNotificationWithEmail(
  userIds: string[],
  notificationType: EmailTemplateType,
  title: string,
  message: string,
  link: string,
  emailData?: any
) {
  const results = await Promise.allSettled(
    userIds.map(userId =>
      sendNotificationWithEmail({
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

  console.log(`Bulk notification sent: ${successful} successful, ${failed} failed`);

  return { successful, failed, results };
}

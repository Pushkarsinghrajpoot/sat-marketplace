import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationWithEmail } from '@/lib/notification-with-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationType, title, message, link, emailData } = body;

    if (!userId || !notificationType || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendNotificationWithEmail({
      userId,
      notificationType,
      title,
      message,
      link,
      emailData,
    });

    if (result.error) {
      console.error('Error sending notification:', result.error);
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { supabase } from './supabase';

export interface CreateNotificationParams {
  userId: string;
  notificationType: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        notification_type: params.notificationType,
        title: params.title,
        message: params.message,
        link: params.link,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return false;
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadNotificationCount:', error);
    return 0;
  }
}

export async function notifyQuoteRequest(params: {
  distributorUserId: string;
  productName: string;
  resellerName: string;
  inquiryId: string;
}) {
  return createNotification({
    userId: params.distributorUserId,
    notificationType: 'QUOTE_REQUEST',
    title: 'New Quote Request',
    message: `${params.resellerName} requested a quote for ${params.productName}`,
    link: `/distributor/inquiries/${params.inquiryId}`
  });
}

export async function notifyQuoteReady(params: {
  resellerUserId: string;
  productName: string;
  quoteId: string;
}) {
  return createNotification({
    userId: params.resellerUserId,
    notificationType: 'QUOTE_READY',
    title: 'Quote Ready',
    message: `Your quote for ${params.productName} is ready for review`,
    link: `/reseller/quotes/${params.quoteId}`
  });
}

export async function notifyDealEngagement(params: {
  distributorUserId: string;
  dealName: string;
  resellerName: string;
  dealId: string;
}) {
  return createNotification({
    userId: params.distributorUserId,
    notificationType: 'DEAL_ENGAGEMENT',
    title: 'Deal Engagement Request',
    message: `${params.resellerName} invited you to participate in ${params.dealName}`,
    link: `/distributor/deals/${params.dealId}`
  });
}

export async function notifyChatMessage(params: {
  recipientUserId: string;
  senderName: string;
  conversationId: string;
}) {
  return createNotification({
    userId: params.recipientUserId,
    notificationType: 'CHAT_MESSAGE',
    title: 'New Message',
    message: `${params.senderName} sent you a message`,
    link: `/chat/${params.conversationId}`
  });
}

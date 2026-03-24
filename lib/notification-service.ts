import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  created_at: string;
}

/**
 * Fetch notifications for a specific user
 */
export async function getNotifications(userId: string, filters?: {
  read?: boolean;
  type?: string;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read);
    }

    if (filters?.type) {
      query = query.eq('notification_type', filters.type);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as Notification[], error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { count: 0, error };
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

/**
 * Mark a single notification as unread
 */
export async function markAsUnread(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: false })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    return { success: false, error };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error };
  }
}

/**
 * Delete all read notifications for a user
 */
export async function deleteAllRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    return { success: false, error };
  }
}

/**
 * Subscribe to real-time notification changes for a user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Get notification icon and color based on type
 */
export function getNotificationStyle(type: string) {
  const styles = {
    QUOTE_RECEIVED: {
      color: 'text-blue-600 bg-blue-100',
      icon: 'FileText',
    },
    QUOTE_ACCEPTED: {
      color: 'text-green-600 bg-green-100',
      icon: 'CheckCircle',
    },
    QUOTE_REMINDER: {
      color: 'text-yellow-600 bg-yellow-100',
      icon: 'Bell',
    },
    DEAL_CONVERTED: {
      color: 'text-purple-600 bg-purple-100',
      icon: 'RefreshCw',
    },
    CREDIT_REQUEST: {
      color: 'text-indigo-600 bg-indigo-100',
      icon: 'CreditCard',
    },
    CREDIT_APPROVED: {
      color: 'text-green-600 bg-green-100',
      icon: 'CheckCircle',
    },
    CREDIT_REJECTED: {
      color: 'text-red-600 bg-red-100',
      icon: 'XCircle',
    },
    CREDIT_MORE_INFO: {
      color: 'text-orange-600 bg-orange-100',
      icon: 'AlertCircle',
    },
    CREDIT_INFO_PROVIDED: {
      color: 'text-blue-600 bg-blue-100',
      icon: 'FileText',
    },
    ENGAGEMENT_REQUEST: {
      color: 'text-purple-600 bg-purple-100',
      icon: 'Users',
    },
    ENGAGEMENT_APPROVED: {
      color: 'text-green-600 bg-green-100',
      icon: 'CheckCircle',
    },
    ENGAGEMENT_DECLINED: {
      color: 'text-red-600 bg-red-100',
      icon: 'XCircle',
    },
    ACTIVITY_ACKNOWLEDGED: {
      color: 'text-green-600 bg-green-100',
      icon: 'Award',
    },
    ACTIVITY_REJECTED: {
      color: 'text-red-600 bg-red-100',
      icon: 'XCircle',
    },
    QUERY_RESPONSE: {
      color: 'text-blue-600 bg-blue-100',
      icon: 'MessageSquare',
    },
    INVOICE_ISSUED: {
      color: 'text-indigo-600 bg-indigo-100',
      icon: 'FileText',
    },
  };

  return styles[type as keyof typeof styles] || {
    color: 'text-gray-600 bg-gray-100',
    icon: 'Bell',
  };
}

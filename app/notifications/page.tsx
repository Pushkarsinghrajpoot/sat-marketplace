'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, FileText, Bell, XCircle, AlertCircle, 
  CreditCard, Users, Award, MessageSquare, RefreshCw, Settings, Trash2 
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useSimpleAuth } from '@/lib/simple-auth';
import { 
  getNotifications, 
  markAsRead, 
  markAsUnread, 
  markAllAsRead, 
  deleteNotification,
  getNotificationStyle,
  subscribeToNotifications,
  type Notification 
} from '@/lib/notification-service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      // Subscribe to real-time updates
      const channel = subscribeToNotifications(user.id, (payload) => {
        console.log('Notification update:', payload);
        fetchNotifications();
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user?.id, activeTab]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const filters: any = {};
      
      if (activeTab === 'unread') {
        filters.read = false;
      } else if (activeTab !== 'all') {
        filters.type = activeTab.toUpperCase();
      }

      const { data, error } = await getNotifications(user.id, filters);
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, currentRead: boolean) => {
    setProcessingIds(prev => new Set(prev).add(notificationId));
    
    try {
      const { error } = currentRead 
        ? await markAsUnread(notificationId)
        : await markAsRead(notificationId);
      
      if (error) throw error;
      
      await fetchNotifications();
      toast.success(currentRead ? 'Marked as unread' : 'Marked as read');
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await markAllAsRead(user.id);
      
      if (error) throw error;
      
      await fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    setProcessingIds(prev => new Set(prev).add(notificationId));
    
    try {
      const { error } = await deleteNotification(notificationId);
      
      if (error) throw error;
      
      await fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to link if available
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      CheckCircle, FileText, Bell, XCircle, AlertCircle,
      CreditCard, Users, Award, MessageSquare, RefreshCw
    };
    return icons[iconName] || Bell;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const typeCount = (type: string) => {
    if (type === 'all') return notifications.length;
    if (type === 'unread') return unreadCount;
    return notifications.filter(n => n.notification_type === type.toUpperCase()).length;
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Please log in to view your notifications</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Stay updated with your marketplace activity</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'quote_received', label: 'Quotes' },
                  { key: 'credit_request', label: 'Credit' },
                  { key: 'engagement_request', label: 'Engagements' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label} ({typeCount(tab.key)})
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const style = getNotificationStyle(notification.notification_type);
                  const Icon = getIconComponent(style.icon);
                  const isProcessing = processingIds.has(notification.id);
                  
                  return (
                    <Card 
                      key={notification.id} 
                      className={`transition-all ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'} ${
                        notification.link ? 'cursor-pointer hover:shadow-md' : ''
                      }`}
                      onClick={() => notification.link && handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                              {!notification.read && (
                                <Badge variant="default" className="ml-2 bg-blue-600">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">{formatRelativeTime(notification.created_at)}</p>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id, notification.read)}
                              disabled={isProcessing}
                            >
                              {notification.read ? 'Unread' : 'Read'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                              disabled={isProcessing}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

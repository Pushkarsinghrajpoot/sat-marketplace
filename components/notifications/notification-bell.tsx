'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleAuth } from '@/lib/simple-auth';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead,
  subscribeToNotifications,
  getNotificationStyle,
  type Notification 
} from '@/lib/notification-service';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { 
  CheckCircle, FileText, XCircle, AlertCircle, 
  CreditCard, Users, Award, MessageSquare, RefreshCw 
} from 'lucide-react';

export function NotificationBell() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      
      // Subscribe to real-time updates
      const channel = subscribeToNotifications(user.id, () => {
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications();
        }
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user?.id, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    
    const { count } = await getUnreadCount(user.id);
    setUnreadCount(count);
  };

  const fetchNotifications = async () => {
    if (!user?.id) {
      console.log('No user ID, cannot fetch notifications');
      return;
    }
    
    console.log('Fetching notifications for user:', user.id);
    setLoading(true);
    try {
      const { data, error } = await getNotifications(user.id, { limit: 10 });
      if (error) {
        console.error('Error fetching notifications:', error);
      }
      console.log('Fetched notifications:', data?.length || 0, 'items');
      setNotifications(data || []);
    } catch (error) {
      console.error('Exception fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    console.log('Notification bell clicked, current isOpen:', isOpen);
    if (!isOpen) {
      console.log('Fetching notifications...');
      fetchNotifications();
    }
    setIsOpen(!isOpen);
    console.log('New isOpen state will be:', !isOpen);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
      fetchUnreadCount();
      fetchNotifications();
    }
    
    // Close dropdown
    setIsOpen(false);
    
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

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={handleToggle}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-hidden shadow-lg z-50">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const style = getNotificationStyle(notification.notification_type);
                    const Icon = getIconComponent(style.icon);
                    
                    return (
                      <Link
                        key={notification.id}
                        href={notification.link || '/notifications'}
                        onClick={() => handleNotificationClick(notification)}
                        className={`block p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="border-t p-3">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

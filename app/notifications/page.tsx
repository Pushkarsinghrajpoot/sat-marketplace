'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Handshake, Package, Star, Settings } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const notifications = [
    {
      id: '1',
      type: 'engagement',
      icon: Handshake,
      title: 'New engagement request',
      message: 'ABC Resellers Inc. sent you an engagement request for Enterprise Network Upgrade',
      read: false,
      createdAt: '2024-01-25T10:30:00Z',
    },
    {
      id: '2',
      type: 'quote',
      icon: FileText,
      title: 'Quote submitted',
      message: 'Your quote for Deal #D-2024-1234 has been submitted successfully',
      read: false,
      createdAt: '2024-01-25T09:15:00Z',
    },
    {
      id: '3',
      type: 'deal',
      icon: CheckCircle,
      title: 'Deal won',
      message: 'Congratulations! You won the deal with Premier Solutions Group ($125,000)',
      read: false,
      createdAt: '2024-01-24T16:45:00Z',
    },
    {
      id: '4',
      type: 'review',
      icon: Star,
      title: 'New review received',
      message: 'You received a 5-star review from TechVentures LLC',
      read: true,
      createdAt: '2024-01-24T14:20:00Z',
    },
    {
      id: '5',
      type: 'inventory',
      icon: Package,
      title: 'Low inventory alert',
      message: 'Cisco Catalyst 9300 stock is running low (12 units remaining)',
      read: true,
      createdAt: '2024-01-23T11:00:00Z',
    },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'text-blue-600 bg-blue-100';
      case 'quote': return 'text-purple-600 bg-purple-100';
      case 'deal': return 'text-green-600 bg-green-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'inventory': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
                <Button variant="outline" size="sm">
                  Mark all as read
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 border-b border-gray-200">
                {[
                  { key: 'all', label: 'All', count: 5 },
                  { key: 'unread', label: 'Unread', count: 3 },
                  { key: 'engagements', label: 'Engagements', count: 1 },
                  { key: 'quotes', label: 'Quotes', count: 1 },
                  { key: 'deals', label: 'Deals', count: 1 },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <Card key={notification.id} className={notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            {!notification.read && (
                              <Badge variant="info" className="ml-2">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">{formatRelativeTime(notification.createdAt)}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {notification.read ? 'Mark unread' : 'Mark read'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

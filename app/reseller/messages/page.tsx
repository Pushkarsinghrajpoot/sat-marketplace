'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Eye } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function ResellerMessagesPage() {
  const { user, organization } = useSimpleAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('reseller-messages')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        }, () => {
          loadConversations();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, filter]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('chat_conversations')
        .select(`
          *,
          products (
            id,
            name,
            sku
          ),
          organizations:distributor_id (
            id,
            name,
            logo
          )
        `)
        .eq('customer_organization_id', user?.organizationId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        const statusMap = {
          active: 'ACTIVE',
          closed: 'CLOSED'
        };
        query = query.eq('status', statusMap[filter]);
      }

      const { data: conversations, error } = await query;

      if (error) throw error;

      // Fetch latest messages for each conversation
      if (conversations) {
        const conversationsWithMessages = await Promise.all(
          conversations.map(async (conv) => {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(10);

            return {
              ...conv,
              chat_messages: messages || []
            };
          })
        );
        setConversations(conversationsWithMessages);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = (conversation: any) => {
    if (!conversation.chat_messages) return 0;
    return conversation.chat_messages.filter(
      (msg: any) => !msg.is_read && msg.sender_id !== user?.id
    ).length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600">Chat conversations with distributors</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Messages
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'closed' ? 'primary' : 'outline'}
          onClick={() => setFilter('closed')}
        >
          Closed
        </Button>
      </div>

      {/* Conversations List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading conversations...</p>
          </CardContent>
        </Card>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No conversations found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => {
            const unreadCount = getUnreadCount(conv);
            const lastMessage = conv.chat_messages?.[0];

            return (
              <Card key={conv.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge>{conv.conversation_type}</Badge>
                        <Badge variant={conv.status === 'ACTIVE' ? 'success' : 'default'}>
                          {conv.status}
                        </Badge>
                        {unreadCount > 0 && (
                          <Badge variant="danger">{unreadCount} new</Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg mb-2">
                        {conv.subject || 'No Subject'}
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        {conv.products && (
                          <div>
                            <p className="text-sm text-gray-600">Product</p>
                            <p className="font-medium">{conv.products.name}</p>
                            <p className="text-sm text-gray-500">SKU: {conv.products.sku}</p>
                          </div>
                        )}
                        {conv.organizations && (
                          <div>
                            <p className="text-sm text-gray-600">Distributor</p>
                            <p className="font-medium">{conv.organizations.name}</p>
                          </div>
                        )}
                      </div>

                      {lastMessage && (
                        <div className="bg-gray-50 rounded p-3 mb-2">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {lastMessage.message_text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link href={`/reseller/messages/${conv.id}`}>
                      <Button>
                        <Eye className="h-4 w-4 mr-2" />
                        {unreadCount > 0 ? 'View' : 'Open'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

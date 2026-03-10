'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, CheckCircle, Package } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { sendChatMessage, getConversationById } from '@/lib/chat-helpers';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DistributorConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, organization } = useSimpleAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel(`conversation-${params.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${params.id}`
      }, (payload) => {
        setMessages(prev => {
          // Avoid duplicates - check if message already exists
          if (prev.some(msg => msg.id === payload.new.id)) {
            return prev;
          }
          return [...prev, payload.new];
        });
        scrollToBottom();
        markMessagesAsRead();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const data = await getConversationById(params.id as string);
      setConversation(data);
      setMessages(data?.chat_messages || []);
      markMessagesAsRead();
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', params.id)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const message = await sendChatMessage({
        conversationId: params.id as string,
        senderId: user.id,
        senderRole: 'DISTRIBUTOR',
        messageType: 'TEXT',
        messageText: newMessage.trim()
      });

      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    try {
      await supabase
        .from('chat_conversations')
        .update({ status: 'CLOSED' })
        .eq('id', params.id);

      toast.success('Conversation marked as resolved');
      router.push('/distributor/messages');
    } catch (error) {
      console.error('Error resolving conversation:', error);
      toast.error('Failed to resolve conversation');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Conversation not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/distributor/messages">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2">{conversation.subject || 'Chat Conversation'}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge>{conversation.conversation_type}</Badge>
                    <Badge variant={conversation.status === 'ACTIVE' ? 'success' : 'default'}>
                      {conversation.status}
                    </Badge>
                  </div>
                </div>
                {conversation.status === 'ACTIVE' && (
                  <Button onClick={handleResolve} variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-3 ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{msg.sender_role}</p>
                      <p className="text-sm">{msg.message_text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={sending || conversation.status !== 'ACTIVE'}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending || conversation.status !== 'ACTIVE'}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {conversation.products && (
            <Card>
              <CardHeader>
                <CardTitle>Product Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{conversation.products.name}</p>
                      <p className="text-sm text-gray-600">SKU: {conversation.products.sku}</p>
                    </div>
                  </div>
                  <Link href={`/products/${conversation.products.id}`}>
                    <Button variant="outline" className="w-full">
                      View Product
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/distributor/inquiries/create?conversation=${conversation.id}`}>
                <Button variant="outline" className="w-full">
                  Create Inquiry
                </Button>
              </Link>
              <Link href={`/distributor/quotes/create?conversation=${conversation.id}`}>
                <Button variant="outline" className="w-full">
                  Create Quote
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {conversation.users ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{conversation.users.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{conversation.users.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No customer info available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, MessageCircle } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import { supabase } from '@/lib/supabase';
import { createChatConversation, sendChatMessage, getConversationById } from '@/lib/chat-helpers';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/types';

interface ProductChatModalProps {
  productId: string;
  productName: string;
  distributorId: string;
  onClose: () => void;
}

export function ProductChatModal({ productId, productName, distributorId, onClose }: ProductChatModalProps) {
  const { user, organization } = useSimpleAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversation?.id) return;

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel(`customer-chat-${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(msg => msg.id === payload.new.id)) {
            return prev;
          }
          return [...prev, payload.new as any];
        });
        scrollToBottom();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    if (!user) {
      toast.error('Please sign in to chat');
      onClose();
      return;
    }

    try {
      // Create or find existing conversation for this product
      const conv = await createChatConversation({
        conversationType: 'PRODUCT_INQUIRY',
        productId: productId,
        customerId: user.id,
        distributorId: distributorId,
        resellerId: organization?.type === 'RESELLER' ? user.id : undefined,
        subject: `Inquiry about ${productName}`,
        priority: 'NORMAL'
      });

      if (conv) {
        setConversation(conv);
        // Load existing messages
        const convData = await getConversationById(conv.id);
        setMessages(convData?.chat_messages || []);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || !user) return;

    setLoading(true);
    try {
      const message = await sendChatMessage({
        conversationId: conversation.id,
        senderId: user.id,
        senderRole: organization?.type || 'CUSTOMER',
        messageType: 'TEXT',
        messageText: newMessage.trim()
      });

      if (message) {
        setMessages(prev => {
          // Avoid duplicates - check if message already exists
          if (prev.some(msg => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        setNewMessage('');
        toast.success('Message sent');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">Please sign in to chat with sales</p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Chat with Sales</h3>
              <p className="text-sm text-gray-600">{productName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {initializing ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">Start a conversation</p>
              <p className="text-sm text-gray-500">Ask about pricing, features, or technical details</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender_id === user.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
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
              disabled={loading || initializing}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading || initializing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            A sales agent will respond shortly during business hours
          </p>
        </div>
      </Card>
    </div>
  );
}

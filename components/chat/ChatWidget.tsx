'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Paperclip, Minimize2 } from 'lucide-react';
import { useSimpleAuth } from '@/lib/simple-auth';
import {
  createChatConversation,
  sendChatMessage,
  getUserConversations,
  getConversationById,
  markMessagesAsRead,
  subscribeToConversation,
  unsubscribeFromConversation
} from '@/lib/chat-helpers';
import { toast } from 'sonner';
import type { ChatConversation, ChatMessage } from '@/lib/types';

export function ChatWidget() {
  const { user } = useSimpleAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
      
      // Subscribe to new messages
      subscriptionRef.current = subscribeToConversation(
        activeConversation.id,
        (newMsg) => {
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        }
      );

      return () => {
        if (subscriptionRef.current) {
          unsubscribeFromConversation(subscriptionRef.current);
        }
      };
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const data = await getUserConversations(user.id, { status: 'ACTIVE' });
      setConversations(data);
      
      // Count unread
      const unread = data.reduce((count: number, conv: any) => {
        const unreadMsgs = conv.messages?.filter((msg: any) => 
          !msg.isRead && msg.senderId !== user.id
        ).length || 0;
        return count + unreadMsgs;
      }, 0);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async () => {
    if (!activeConversation) return;

    try {
      const conv = await getConversationById(activeConversation.id);
      if (conv) {
        setMessages(conv.chat_messages || []);
        
        // Mark as read
        if (user) {
          await markMessagesAsRead(activeConversation.id, user.id);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeConversation) return;

    try {
      const senderRole = user.role === 'RESELLER' ? 'RESELLER' 
        : user.role === 'DISTRIBUTOR' ? 'DISTRIBUTOR'
        : user.role === 'PLATFORM_ADMIN' ? 'AGENT'
        : 'CUSTOMER';

      await sendChatMessage({
        conversationId: activeConversation.id,
        senderId: user.id,
        senderRole,
        messageText: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStartNewChat = async () => {
    if (!user) {
      toast.error('Please login to start a chat');
      return;
    }

    try {
      const conversation = await createChatConversation({
        conversationType: 'PRODUCT_INQUIRY',
        customerId: user.id,
        subject: 'New Inquiry'
      });

      setActiveConversation(conversation);
      await loadConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start chat');
    }
  };

  if (!user) {
    return null; // Don't show chat widget if not logged in
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg relative"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {isOpen && !isMinimized && (
        <Card className="w-96 h-[600px] shadow-2xl flex flex-col">
          <CardHeader className="border-b p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {activeConversation ? 'Chat' : 'Messages'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {!activeConversation ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <Button
                    onClick={handleStartNewChat}
                    className="w-full mb-4"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>

                  <div className="space-y-2">
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">
                            {conv.subject || 'Conversation'}
                          </p>
                          <Badge variant="info" className="text-xs">
                            {conv.conversationType}
                          </Badge>
                        </div>
                        {conv.messages && conv.messages.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {conv.messages[0].messageText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderId === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.messageText}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveConversation(null)}
                    className="mt-2 w-full text-xs"
                  >
                    ← Back to conversations
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {isOpen && isMinimized && (
        <Card className="w-64 shadow-lg">
          <CardHeader className="p-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">Messages</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

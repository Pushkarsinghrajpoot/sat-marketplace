import { supabase } from './supabase';
import type { ChatConversation, ChatMessage, ChatParticipant } from './types';

// Find assigned user for a product
async function findAssignedUserForProduct(productId: string, organizationId: string): Promise<string | null> {
  try {
    // First, try to find a user specifically assigned to this product
    const { data: assignment } = await supabase
      .from('user_assignments')
      .select(`
        user_id,
        users!inner (
          id,
          organization_id
        )
      `)
      .eq('assignment_type', 'PRODUCT')
      .eq('reference_id', productId)
      .eq('users.organization_id', organizationId)
      .limit(1)
      .single();

    if (assignment?.user_id) {
      console.log('Found assigned user for product:', assignment.user_id);
      return assignment.user_id;
    }

    // If no specific assignment, find an admin from the organization
    const { data: admin } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('team_role', 'ADMIN')
      .limit(1)
      .single();

    if (admin?.id) {
      console.log('No product assignment, using admin:', admin.id);
      return admin.id;
    }

    console.log('No assigned user or admin found for organization:', organizationId);
    return null;
  } catch (error) {
    console.error('Error finding assigned user:', error);
    return null;
  }
}

// Create new chat conversation
export async function createChatConversation(conversation: {
  conversationType: string;
  subject?: string;
  productId?: string;
  dealId?: string;
  quoteId?: string;
  boqId?: string;
  customerId: string;
  agentId?: string;
  resellerId?: string;
  distributorId?: string;
  priority?: string;
}) {
  try {
    // Auto-assign to the right team member if it's a product inquiry
    let assignedTo = conversation.agentId;
    
    if (!assignedTo && conversation.productId && conversation.distributorId) {
      const foundUser = await findAssignedUserForProduct(conversation.productId, conversation.distributorId);
      if (foundUser) {
        assignedTo = foundUser;
      }
    }

    console.log('Creating chat conversation, assigned_to:', assignedTo);

    // Convert camelCase to snake_case for database
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert([{
        conversation_type: conversation.conversationType,
        subject: conversation.subject,
        product_id: conversation.productId,
        deal_id: conversation.dealId,
        quote_id: conversation.quoteId,
        boq_id: conversation.boqId,
        customer_id: conversation.customerId,
        agent_id: conversation.agentId,
        reseller_id: conversation.resellerId,
        distributor_id: conversation.distributorId,
        assigned_to: assignedTo,
        status: 'ACTIVE',
        priority: conversation.priority || 'NORMAL'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    // Add participants (avoid duplicates)
    if (data) {
      const participantsToAdd = new Map<string, string>();
      
      // Customer is the primary participant
      participantsToAdd.set(conversation.customerId, 'CUSTOMER');
      
      // Add other participants if provided and not already added
      if (conversation.agentId && !participantsToAdd.has(conversation.agentId)) {
        participantsToAdd.set(conversation.agentId, 'AGENT');
      }
      if (conversation.resellerId && !participantsToAdd.has(conversation.resellerId)) {
        participantsToAdd.set(conversation.resellerId, 'RESELLER');
      }
      
      // Add assigned user if set
      if (assignedTo && !participantsToAdd.has(assignedTo)) {
        participantsToAdd.set(assignedTo, 'AGENT');
        console.log('Adding assigned user as participant:', assignedTo);
      }
      
      // Add all unique participants
      for (const [userId, role] of participantsToAdd) {
        await addChatParticipant(data.id, userId, role);
      }
    }

    return data;
  } catch (error) {
    console.error('Error in createChatConversation:', error);
    throw error;
  }
}

// Add participant to conversation
export async function addChatParticipant(conversationId: string, userId: string, role: string) {
  try {
    // Use upsert to avoid duplicate key errors
    const { data, error } = await supabase
      .from('chat_participants')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        role,
        is_active: true,
        joined_at: new Date().toISOString()
      }, {
        onConflict: 'conversation_id,user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding participant:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addChatParticipant:', error);
    throw error;
  }
}

// Send chat message
export async function sendChatMessage(message: {
  conversationId: string;
  senderId: string;
  senderRole: string;
  messageType?: string;
  messageText?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Convert camelCase to snake_case for database
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: message.conversationId,
        sender_id: message.senderId,
        sender_role: message.senderRole,
        message_type: message.messageType || 'TEXT',
        message_text: message.messageText,
        metadata: message.metadata,
        is_read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}

// Get conversations for user
export async function getUserConversations(userId: string, filters?: {
  status?: string;
  conversationType?: string;
}) {
  try {
    let query = supabase
      .from('chat_conversations')
      .select(`
        *,
        chat_participants!inner (
          user_id,
          role
        ),
        chat_messages (
          id,
          message_text,
          created_at
        )
      `)
      .eq('chat_participants.user_id', userId)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.conversationType) {
      query = query.eq('conversation_type', filters.conversationType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    return [];
  }
}

// Get conversation by ID with all messages
export async function getConversationById(conversationId: string) {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        chat_participants (
          *,
          users (*)
        ),
        chat_messages (
          *,
          users (*),
          chat_attachments (*)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getConversationById:', error);
    return null;
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }

    // Update participant last_read_at
    await supabase
      .from('chat_participants')
      .update({
        last_read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
  }
}

// Get unread message count for user
export async function getUnreadMessageCount(userId: string) {
  try {
    // First get conversation IDs for user
    const { data: participantData } = await supabase
      .from('chat_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (!participantData || participantData.length === 0) {
      return 0;
    }

    const conversationIds = participantData.map(p => p.conversation_id);

    // Then count unread messages
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadMessageCount:', error);
    return 0;
  }
}

// Close conversation
export async function closeConversation(conversationId: string) {
  try {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ status: 'CLOSED' })
      .eq('id', conversationId);

    if (error) {
      console.error('Error closing conversation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in closeConversation:', error);
    throw error;
  }
}

// Assign agent to conversation
export async function assignAgentToConversation(conversationId: string, agentId: string) {
  try {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ agent_id: agentId })
      .eq('id', conversationId);

    if (error) {
      console.error('Error assigning agent:', error);
      throw error;
    }

    // Add agent as participant
    await addChatParticipant(conversationId, agentId, 'AGENT');
  } catch (error) {
    console.error('Error in assignAgentToConversation:', error);
    throw error;
  }
}

// Add file attachment to message
export async function addChatAttachment(attachment: {
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('chat_attachments')
      .insert([attachment])
      .select()
      .single();

    if (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addChatAttachment:', error);
    throw error;
  }
}

// Subscribe to new messages in conversation
export function subscribeToConversation(
  conversationId: string,
  onMessage: (message: ChatMessage) => void
) {
  const subscription = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        onMessage(payload.new as ChatMessage);
      }
    )
    .subscribe();

  return subscription;
}

// Unsubscribe from conversation
export function unsubscribeFromConversation(subscription: any) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

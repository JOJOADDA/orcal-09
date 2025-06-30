
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatRoom, MessageFile } from '@/types/database';
import { unifiedFileService } from './unifiedFileService';

interface SendMessageData {
  order_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'client' | 'admin' | 'designer' | 'system';
  content: string;
  message_type?: 'text' | 'file' | 'system';
  files?: File[];
}

export class UnifiedChatService {
  async getOrCreateChatRoom(orderId: string, clientId: string): Promise<ChatRoom | null> {
    try {
      // Try to get existing room
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching chat room:', fetchError);
        return null;
      }

      if (existingRoom) {
        return existingRoom as ChatRoom;
      }

      // Create new room if it doesn't exist
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          order_id: orderId,
          client_id: clientId,
          admin_id: null,
          unread_count: 0,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating chat room:', createError);
        return null;
      }

      return newRoom as ChatRoom;
    } catch (error) {
      console.error('Error in getOrCreateChatRoom:', error);
      return null;
    }
  }

  async getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      console.log('Fetching messages for order:', orderId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      console.log(`Fetched ${data?.length || 0} messages`);
      return data as ChatMessage[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async sendMessage(messageData: SendMessageData): Promise<{success: boolean, message?: ChatMessage, error?: any}> {
    try {
      console.log('Sending message:', messageData.content.substring(0, 50));

      // Get or create chat room
      const room = await this.getOrCreateChatRoom(messageData.order_id, messageData.sender_id);
      if (!room) {
        throw new Error('Failed to get or create chat room');
      }

      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: messageData.sender_role,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          is_read: false
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        return { success: false, error: messageError };
      }

      const chatMessage = message as ChatMessage;

      // Handle file uploads if any
      if (messageData.files && messageData.files.length > 0) {
        console.log(`Uploading ${messageData.files.length} files`);
        
        for (const file of messageData.files) {
          const fileUrl = await unifiedFileService.uploadFile(file, messageData.order_id, messageData.sender_id);
          if (fileUrl) {
            await unifiedFileService.createMessageFile(chatMessage.id, file, fileUrl);
          }
        }
      }

      console.log('Message sent successfully:', chatMessage.id);
      return { success: true, message: chatMessage };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, error };
    }
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .neq('sender_id', userId);

      if (error) {
        console.error('Error marking messages as read:', error);
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  }

  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void) {
    console.log('Setting up real-time subscription for order:', orderId);

    const channel = supabase
      .channel(`messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('New message received via real-time:', payload.new);
          const message = payload.new as ChatMessage;
          callback(message);
        }
      )
      .subscribe((status) => {
        console.log('Chat subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from chat messages');
      supabase.removeChannel(channel);
    };
  }
}

export const unifiedChatService = new UnifiedChatService();

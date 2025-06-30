
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
      console.log('Getting or creating chat room for order:', orderId);
      
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
        console.log('Found existing chat room:', existingRoom.id);
        return existingRoom as ChatRoom;
      }

      // Create new room if it doesn't exist
      console.log('Creating new chat room for order:', orderId);
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

      console.log('Created new chat room:', newRoom.id);
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

      console.log(`Fetched ${data?.length || 0} messages for order:`, orderId);
      return data as ChatMessage[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async sendMessage(messageData: SendMessageData): Promise<{success: boolean, message?: ChatMessage, error?: any}> {
    try {
      console.log('Sending message for order:', messageData.order_id);

      // Get or create chat room first
      const room = await this.getOrCreateChatRoom(messageData.order_id, messageData.sender_id);
      if (!room) {
        console.error('Failed to get or create chat room');
        return { success: false, error: 'Failed to get or create chat room' };
      }

      console.log('Using chat room:', room.id);

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

      console.log('Message sent successfully:', message.id);
      const chatMessage = message as ChatMessage;

      // Handle file uploads if any
      if (messageData.files && messageData.files.length > 0) {
        console.log(`Uploading ${messageData.files.length} files`);
        
        for (const file of messageData.files) {
          try {
            const fileUrl = await unifiedFileService.uploadFile(file, messageData.order_id, messageData.sender_id);
            if (fileUrl) {
              await unifiedFileService.createMessageFile(chatMessage.id, file, fileUrl);
              console.log('File uploaded and linked to message:', file.name);
            }
          } catch (fileError) {
            console.error('Error uploading file:', file.name, fileError);
          }
        }
      }

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
      } else {
        console.log('Messages marked as read for order:', orderId);
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


import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, OrderFile, MessageFile } from '@/types/database';
import { MessageValidationService } from './MessageValidationService';

export class MessageDataService {
  async getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      console.log('=== Fetching messages ===');
      console.log('Order ID:', orderId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      const messages = data.map(message => ({
        ...message,
        sender_role: message.sender_role as 'client' | 'admin' | 'designer' | 'system',
        message_type: message.message_type as 'text' | 'file' | 'system'
      })) as ChatMessage[];

      console.log('Messages fetched successfully:', messages.length);
      console.log('Sample messages:', messages.slice(0, 3).map(m => ({
        id: m.id,
        content: m.content.substring(0, 50),
        sender_name: m.sender_name,
        sender_role: m.sender_role,
        created_at: m.created_at
      })));
      
      return messages;
    } catch (error) {
      MessageValidationService.handleError(error, 'Get Messages');
      return [];
    }
  }

  async insertMessage(roomId: string, messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'designer' | 'system';
    content: string;
    message_type: 'text' | 'file' | 'system';
  }): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    try {
      // حفظ دور المرسل الأصلي (لا نغيره)
      const dbSenderRole = messageData.sender_role;
      console.log('Database sender role (original):', dbSenderRole);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: dbSenderRole as 'admin' | 'client' | 'designer',
          content: messageData.content,
          message_type: messageData.message_type,
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Database error sending message:', error);
        return { success: false, error };
      }

      console.log('Message sent successfully with ID:', data.id);
      return { success: true, message: data as ChatMessage };
    } catch (error) {
      console.error('Unexpected error in insertMessage:', error);
      return { success: false, error: MessageValidationService.handleError(error, 'Insert Message') };
    }
  }

  async attachFileToMessage(messageId: string, file: OrderFile): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('message_files')
        .insert({
          message_id: messageId,
          name: file.name,
          url: file.url,
          file_type: file.file_type,
          size_bytes: file.size_bytes
        });

      if (error) {
        console.error('Error attaching file:', error);
        return false;
      }

      return true;
    } catch (error) {
      MessageValidationService.handleError(error, 'Attach File to Message');
      return false;
    }
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .neq('sender_id', userId);

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      const { error: roomError } = await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('order_id', orderId);

      if (roomError) {
        console.error('Error updating room unread count:', roomError);
      }

      return true;
    } catch (error) {
      MessageValidationService.handleError(error, 'Mark Messages As Read');
      return false;
    }
  }

  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    try {
      const { data, error } = await supabase
        .from('message_files')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        console.error('Error fetching message files:', error);
        return [];
      }

      return data.map(file => ({
        ...file,
        file_type: file.file_type as 'image' | 'document' | 'design'
      })) as MessageFile[];
    } catch (error) {
      MessageValidationService.handleError(error, 'Get Message Files');
      return [];
    }
  }
}


import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, OrderFile, MessageFile } from '@/types/database';
import { chatRoomService } from './ChatRoomService';

export class MessageService {
  private handleError(error: any, context: string) {
    console.error(`[MessageService ${context}] Error:`, error);
    return error;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private async verifyDesignerProfile(designerId: string): Promise<boolean> {
    try {
      console.log('Verifying designer profile exists:', designerId);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', designerId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking designer profile:', fetchError);
        return false;
      }

      if (existingProfile) {
        console.log('Designer profile verified:', existingProfile);
        return true;
      }

      console.log('Designer profile not found - this should not happen for authenticated users');
      return false;
    } catch (error) {
      console.error('Error verifying designer profile:', error);
      return false;
    }
  }

  async getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      console.log('=== Fetching messages ===');
      console.log('Order ID:', orderId);
      
      if (!this.isValidUUID(orderId)) {
        console.error('Invalid order ID format:', orderId);
        return [];
      }
      
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
      this.handleError(error, 'Get Messages');
      return [];
    }
  }

  async sendMessage(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'designer' | 'system';
    content: string;
    message_type?: 'text' | 'file' | 'system';
    files?: OrderFile[];
  }): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    try {
      console.log('=== SENDING MESSAGE ===');
      console.log('Sender:', messageData.sender_name, 'Role:', messageData.sender_role, 'ID:', messageData.sender_id);
      console.log('Order ID:', messageData.order_id);
      console.log('Content:', messageData.content.substring(0, 100) + '...');
      
      if (!this.isValidUUID(messageData.order_id)) {
        console.error('Invalid order ID format:', messageData.order_id);
        return { success: false, error: { message: 'Invalid order ID format' } };
      }

      if (!this.isValidUUID(messageData.sender_id)) {
        console.error('Invalid sender ID format:', messageData.sender_id);
        return { success: false, error: { message: 'Invalid sender ID format' } };
      }

      // للمصممين: التحقق من وجود ملف التعريف فقط (بدون إنشاء)
      if (messageData.sender_role === 'designer') {
        const profileExists = await this.verifyDesignerProfile(messageData.sender_id);
        if (!profileExists) {
          console.error('Designer profile verification failed');
          return { success: false, error: { message: 'Designer profile not found. Please ensure you are logged in properly.' } };
        }
      }

      // التأكد من وجود غرفة الدردشة
      const room = await chatRoomService.getOrCreateChatRoom(
        messageData.order_id, 
        messageData.sender_id, 
        messageData.sender_role
      );
      
      if (!room) {
        console.error('Failed to get or create chat room');
        return { success: false, error: { message: 'Failed to get or create chat room' } };
      }

      console.log('Using chat room:', room.id);

      // تحويل دور المصمم إلى admin لقاعدة البيانات
      const dbSenderRole = messageData.sender_role === 'designer' ? 'admin' : messageData.sender_role;
      console.log('Database sender role:', dbSenderRole);

      // إرسال الرسالة
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: dbSenderRole,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Database error sending message:', error);
        return { success: false, error };
      }

      console.log('Message sent successfully with ID:', data.id);

      // رفع الملفات إذا كانت موجودة
      if (messageData.files && messageData.files.length > 0) {
        for (const file of messageData.files) {
          await this.attachFileToMessage(data.id, file);
        }
      }

      // تحديث غرفة الدردشة
      await chatRoomService.updateRoomUnreadCount(room.id, 1);

      console.log('=== MESSAGE SENT SUCCESSFULLY ===');
      return { success: true, message: data as ChatMessage };
    } catch (error) {
      console.error('Unexpected error in sendMessage:', error);
      return { success: false, error: this.handleError(error, 'Send Message') };
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
      this.handleError(error, 'Attach File to Message');
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
      this.handleError(error, 'Mark Messages As Read');
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
      this.handleError(error, 'Get Message Files');
      return [];
    }
  }
}

export const messageService = new MessageService();

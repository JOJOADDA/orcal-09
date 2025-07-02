import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatRoom } from '@/types/database';
import { chatRoomService } from './ChatRoomService';

export class DesignerChatService {
  // تأكيد ربط المصمم بغرفة الدردشة
  static async ensureDesignerInChatRoom(orderId: string, designerId: string): Promise<ChatRoom | null> {
    try {
      console.log('=== Ensuring designer in chat room ===');
      console.log('Order ID:', orderId, 'Designer ID:', designerId);
      
      // الحصول على أو إنشاء غرفة الدردشة
      const room = await chatRoomService.getOrCreateChatRoom(orderId, designerId, 'designer');
      
      if (!room) {
        console.error('Failed to get/create chat room for designer');
        return null;
      }

      // تأكيد أن admin_id مضبوط للمصمم
      if (!room.admin_id || room.admin_id !== designerId) {
        console.log('Updating room admin_id to designer:', designerId);
        
        const { data: updatedRoom, error } = await supabase
          .from('chat_rooms')
          .update({ admin_id: designerId })
          .eq('id', room.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating room admin:', error);
          return room;
        }

        console.log('Room admin updated successfully');
        return updatedRoom as ChatRoom;
      }

      return room;
    } catch (error) {
      console.error('Error ensuring designer in chat room:', error);
      return null;
    }
  }

  // إرسال رسالة من المصمم
  static async sendDesignerMessage(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    message_type?: 'text' | 'file' | 'system';
  }): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    try {
      console.log('=== Sending designer message ===');
      console.log('Designer:', messageData.sender_name, 'Content:', messageData.content.substring(0, 50));
      
      // تأكيد وجود المصمم في غرفة الدردشة
      const room = await this.ensureDesignerInChatRoom(messageData.order_id, messageData.sender_id);
      
      if (!room) {
        return { success: false, error: { message: 'فشل في إعداد غرفة الدردشة للمصمم' } };
      }

      // إرسال الرسالة مع role = 'designer'
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: 'designer', // الحفاظ على دور المصمم
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Database error sending designer message:', error);
        return { success: false, error };
      }

      console.log('Designer message sent successfully with ID:', data.id);
      return { success: true, message: data as ChatMessage };
    } catch (error) {
      console.error('Unexpected error in sendDesignerMessage:', error);
      return { success: false, error: { message: error instanceof Error ? error.message : 'خطأ غير متوقع' } };
    }
  }

  // جلب الرسائل للمصمم
  static async getMessagesForDesigner(orderId: string, designerId: string): Promise<ChatMessage[]> {
    try {
      console.log('=== Fetching messages for designer ===');
      console.log('Order ID:', orderId, 'Designer ID:', designerId);
      
      // تأكيد وجود المصمم في غرفة الدردشة أولاً
      await this.ensureDesignerInChatRoom(orderId, designerId);
      
      // جلب جميع الرسائل للطلب
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages for designer:', error);
        return [];
      }

      const messages = data.map(message => ({
        ...message,
        sender_role: message.sender_role as 'client' | 'admin' | 'designer' | 'system',
        message_type: message.message_type as 'text' | 'file' | 'system'
      })) as ChatMessage[];

      console.log('Designer messages fetched successfully:', messages.length);
      return messages;
    } catch (error) {
      console.error('Error in getMessagesForDesigner:', error);
      return [];
    }
  }
}
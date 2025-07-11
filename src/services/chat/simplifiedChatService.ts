import { supabase } from '@/integrations/supabase/client';
import { SimplifiedEmailService } from '../auth/simplifiedEmailService';

export class SimplifiedChatService {
  static async sendMessage(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'designer';
    content: string;
    message_type?: 'text' | 'file' | 'system';
  }): Promise<{ success: boolean; message?: any; error?: string }> {
    try {
      // الحصول على غرفة الدردشة
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('order_id', messageData.order_id)
        .single();

      if (!room) {
        return { success: false, error: 'غرفة الدردشة غير موجودة' };
      }

      // إرسال الرسالة
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: messageData.sender_role,
          content: messageData.content,
          message_type: messageData.message_type || 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, message: data };
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      return { success: false, error: 'حدث خطأ في إرسال الرسالة' };
    }
  }

  static async getMessages(orderId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching messages:', error);
      return [];
    }
  }
}
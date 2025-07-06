import { ChatMessage, OrderFile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { MessageValidationService } from './MessageValidationService';

export class UnifiedMessageService {
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
      console.log('=== UNIFIED MESSAGE SERVICE ===');
      console.log('Sending message:', {
        sender: messageData.sender_name,
        role: messageData.sender_role,
        order_id: messageData.order_id,
        content_length: messageData.content.length
      });

      // التحقق من صحة البيانات
      const validation = MessageValidationService.validateMessageData(messageData);
      if (!validation.isValid) {
        console.error('Message validation failed:', validation.error);
        return { success: false, error: { message: validation.error } };
      }

      // التحقق من صحة المستخدم
      const userValidation = await this.validateUserProfile(messageData.sender_id, messageData.sender_role);
      if (!userValidation.success) {
        return userValidation;
      }

      // التحقق من وجود الطلب
      const orderValidation = await this.validateOrder(messageData.order_id);
      if (!orderValidation.success) {
        return orderValidation;
      }

      // الحصول على أو إنشاء غرفة الدردشة
      const chatRoom = await this.getOrCreateChatRoom(messageData.order_id, messageData.sender_id, messageData.sender_role);
      if (!chatRoom) {
        return { success: false, error: { message: 'فشل في الوصول لغرفة الدردشة' } };
      }

      // إرسال الرسالة
      const result = await this.insertMessage(chatRoom.id, messageData);
      if (!result.success) {
        return result;
      }

      // تحديث عدد الرسائل غير المقروءة
      await this.updateUnreadCount(chatRoom.id);

      console.log('=== MESSAGE SENT SUCCESSFULLY ===');
      return result;

    } catch (error) {
      console.error('Unexpected error in unified message service:', error);
      return { 
        success: false, 
        error: { 
          message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
          details: error
        } 
      };
    }
  }

  private async validateUserProfile(userId: string, userRole: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user profile:', error);
        return { success: false, error: { message: 'خطأ في التحقق من ملف المستخدم' } };
      }

      if (!profile) {
        return { success: false, error: { message: 'ملف المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.' } };
      }

      if (profile.role !== userRole) {
        console.error('User role mismatch:', { expected: userRole, actual: profile.role });
        return { success: false, error: { message: `دور المستخدم غير صحيح. الدور المتوقع: ${userRole}، الدور الحالي: ${profile.role}` } };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error validating user profile:', error);
      return { success: false, error: { message: 'خطأ في التحقق من ملف المستخدم' } };
    }
  }

  private async validateOrder(orderId: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { data: order, error } = await supabase
        .from('design_orders')
        .select('id, client_id, client_name')
        .eq('id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Error checking order:', error);
        return { success: false, error: { message: 'خطأ في التحقق من الطلب' } };
      }

      if (!order) {
        return { success: false, error: { message: 'الطلب غير موجود' } };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error validating order:', error);
      return { success: false, error: { message: 'خطأ في التحقق من الطلب' } };
    }
  }

  private async getOrCreateChatRoom(orderId: string, userId: string, userRole: string) {
    try {
      // البحث عن غرفة موجودة
      let { data: chatRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (roomError && roomError.code !== 'PGRST116') {
        console.error('Error fetching chat room:', roomError);
        return null;
      }

      if (chatRoom) {
        // تحديث admin_id للمصممين
        if (userRole === 'designer' && chatRoom.admin_id !== userId) {
          await supabase
            .from('chat_rooms')
            .update({ admin_id: userId })
            .eq('id', chatRoom.id);
          chatRoom.admin_id = userId;
        }
        return chatRoom;
      }

      // إنشاء غرفة جديدة
      const { data: order } = await supabase
        .from('design_orders')
        .select('client_id')
        .eq('id', orderId)
        .single();

      if (!order) return null;

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          order_id: orderId,
          client_id: order.client_id,
          admin_id: userRole === 'designer' ? userId : null,
          unread_count: 0,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create chat room:', createError);
        return null;
      }

      return newRoom;
    } catch (error) {
      console.error('Error getting/creating chat room:', error);
      return null;
    }
  }

  private async insertMessage(roomId: string, messageData: any): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: messageData.sender_role,
          content: messageData.content.trim(),
          message_type: messageData.message_type || 'text',
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to insert message:', error);
        
        // رسائل خطأ مفصلة حسب نوع الخطأ
        let errorMessage = 'فشل في إرسال الرسالة';
        if (error.code === '23505') {
          errorMessage = 'الرسالة مكررة';
        } else if (error.code === '42501') {
          errorMessage = 'ليس لديك صلاحية لإرسال رسائل في هذا الطلب';
        } else if (error.code === '23503') {
          errorMessage = 'خطأ في الربط مع الطلب أو الغرفة';
        }

        return { success: false, error: { message: errorMessage, details: error } };
      }

      return { success: true, message: message as ChatMessage };
    } catch (error) {
      console.error('Unexpected error inserting message:', error);
      return { success: false, error: { message: 'خطأ غير متوقع في إرسال الرسالة' } };
    }
  }

  private async updateUnreadCount(roomId: string): Promise<void> {
    try {
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('unread_count')
        .eq('id', roomId)
        .single();

      if (room) {
        await supabase
          .from('chat_rooms')
          .update({
            unread_count: (room.unread_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', roomId);
      }
    } catch (error) {
      console.warn('Failed to update unread count:', error);
    }
  }

  async getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      if (!MessageValidationService.isValidUUID(orderId)) {
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

      return data as ChatMessage[];
    } catch (error) {
      console.error('Unexpected error fetching messages:', error);
      return [];
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

      // تحديث عدد الرسائل غير المقروءة في الغرفة
      await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('order_id', orderId);

      return true;
    } catch (error) {
      console.error('Unexpected error marking messages as read:', error);
      return false;
    }
  }
}

export const unifiedMessageService = new UnifiedMessageService();
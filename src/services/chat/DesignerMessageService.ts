
import { ChatMessage, OrderFile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { MessageValidationService } from './MessageValidationService';

export class DesignerMessageService {
  async sendDesignerMessage(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    content: string;
    message_type?: 'text' | 'file' | 'system';
    files?: OrderFile[];
  }): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    try {
      console.log('=== DESIGNER MESSAGE SERVICE ===');
      console.log('Sending message from designer:', messageData.sender_name);
      console.log('Designer ID:', messageData.sender_id);
      console.log('Order ID:', messageData.order_id);
      console.log('Content length:', messageData.content.length);

      // التحقق من صحة البيانات
      if (!MessageValidationService.isValidUUID(messageData.order_id)) {
        return { success: false, error: { message: 'معرف الطلب غير صالح' } };
      }

      if (!MessageValidationService.isValidUUID(messageData.sender_id)) {
        return { success: false, error: { message: 'معرف المرسل غير صالح' } };
      }

      if (!messageData.content?.trim()) {
        return { success: false, error: { message: 'محتوى الرسالة فارغ' } };
      }

      // التحقق من وجود المصمم في قاعدة البيانات
      const { data: designerProfile, error: designerError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', messageData.sender_id)
        .eq('role', 'designer')
        .maybeSingle();

      if (designerError) {
        console.error('Error checking designer profile:', designerError);
        return { success: false, error: { message: 'خطأ في التحقق من ملف المصمم: ' + designerError.message } };
      }

      if (!designerProfile) {
        console.error('Designer profile not found for user:', messageData.sender_id);
        
        // التحقق من وجود المستخدم في جدول profiles بأي دور
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('id', messageData.sender_id)
          .maybeSingle();

        if (userError) {
          console.error('Error checking user profile:', userError);
          return { success: false, error: { message: 'خطأ في التحقق من ملف المستخدم: ' + userError.message } };
        }

        if (!userProfile) {
          console.error('User profile not found:', messageData.sender_id);
          return { success: false, error: { message: 'ملف المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.' } };
        }

        if (userProfile.role !== 'designer') {
          console.error('User is not a designer:', userProfile.role);
          return { success: false, error: { message: 'المستخدم ليس مصمم. الدور الحالي: ' + userProfile.role } };
        }

        // إذا وصلنا هنا، فهناك مشكلة في استعلام البيانات
        return { success: false, error: { message: 'خطأ غير متوقع في التحقق من ملف المصمم' } };
      }

      console.log('Designer profile verified:', designerProfile);

      // التحقق من وجود الطلب
      const { data: order, error: orderError } = await supabase
        .from('design_orders')
        .select('id, client_id, client_name')
        .eq('id', messageData.order_id)
        .single();

      if (orderError || !order) {
        console.error('Order not found:', orderError);
        return { success: false, error: { message: 'الطلب غير موجود' } };
      }

      console.log('Order found:', order);

      // البحث عن غرفة الدردشة أو إنشاؤها
      let { data: chatRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', messageData.order_id)
        .single();

      if (roomError && roomError.code === 'PGRST116') {
        // إنشاء غرفة دردشة جديدة
        console.log('Creating new chat room for designer');
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            order_id: messageData.order_id,
            client_id: order.client_id,
            admin_id: messageData.sender_id, // ربط المصمم كـ admin
            unread_count: 0,
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create chat room:', createError);
          return { success: false, error: { message: 'فشل في إنشاء غرفة الدردشة: ' + createError.message } };
        }

        chatRoom = newRoom;
        console.log('Chat room created:', chatRoom);
      } else if (roomError) {
        console.error('Error fetching chat room:', roomError);
        return { success: false, error: { message: 'خطأ في الوصول لغرفة الدردشة: ' + roomError.message } };
      } else {
        // تحديث المصمم في الغرفة الموجودة إذا لم يكن محدد
        if (!chatRoom.admin_id) {
          console.log('Updating chat room with designer ID');
          const { error: updateError } = await supabase
            .from('chat_rooms')
            .update({ admin_id: messageData.sender_id })
            .eq('id', chatRoom.id);

          if (updateError) {
            console.warn('Failed to update chat room admin:', updateError);
          }
        }
      }

      console.log('Using chat room:', chatRoom);

      // إرسال الرسالة
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: chatRoom.id,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: 'designer', // استخدام designer للحفاظ على الدور الصحيح
          content: messageData.content.trim(),
          message_type: messageData.message_type || 'text',
          is_read: false
        })
        .select()
        .single();

      if (messageError) {
        console.error('Failed to send message:', messageError);
        return { 
          success: false, 
          error: { 
            message: 'فشل في إرسال الرسالة: ' + messageError.message,
            details: messageError
          } 
        };
      }

      console.log('Message sent successfully:', message);

      // تحديث عدد الرسائل غير المقروءة
      await supabase
        .from('chat_rooms')
        .update({ 
          unread_count: (chatRoom.unread_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatRoom.id);

      console.log('=== DESIGNER MESSAGE SENT SUCCESSFULLY ===');
      return { success: true, message: message as ChatMessage };

    } catch (error) {
      console.error('Unexpected error in designer message service:', error);
      return { 
        success: false, 
        error: { 
          message: 'خطأ غير متوقع في إرسال الرسالة',
          details: error
        } 
      };
    }
  }
}

export const designerMessageService = new DesignerMessageService();

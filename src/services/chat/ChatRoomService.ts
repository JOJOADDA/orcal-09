
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom } from '@/types/database';

export class ChatRoomService {
  private handleError(error: any, context: string) {
    console.error(`[ChatRoomService ${context}] Error:`, error);
    return error;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async getOrCreateChatRoom(orderId: string, userId: string, userRole: string = 'client'): Promise<ChatRoom | null> {
    try {
      console.log('=== Getting/Creating chat room ===');
      console.log('Order ID:', orderId, 'User:', userId, 'Role:', userRole);
      
      if (!this.isValidUUID(orderId)) {
        console.error('Invalid order ID format:', orderId);
        return null;
      }

      // محاولة جلب الغرفة الموجودة
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existingRoom && !fetchError) {
        console.log('Found existing chat room:', existingRoom.id);
        
        // تحديث admin_id إذا كان المستخدم مصمم ولم يكن محدد
        if (userRole === 'designer' && !existingRoom.admin_id) {
          console.log('Updating chat room admin_id for designer');
          const { error: updateError } = await supabase
            .from('chat_rooms')
            .update({ admin_id: userId })
            .eq('id', existingRoom.id);
          
          if (!updateError) {
            existingRoom.admin_id = userId;
            console.log('Chat room admin_id updated successfully');
          }
        }
        
        return existingRoom as ChatRoom;
      }

      // الحصول على معلومات الطلب
      const { data: orderData, error: orderError } = await supabase
        .from('design_orders')
        .select('client_id')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('Error fetching order data:', orderError);
        return null;
      }

      // إنشاء غرفة جديدة
      const roomData: any = {
        order_id: orderId,
        client_id: orderData.client_id,
        admin_id: userRole === 'designer' ? userId : null,
        unread_count: 0,
        is_active: true
      };

      console.log('Creating chat room with data:', roomData);

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert(roomData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating chat room:', createError);
        return null;
      }

      console.log('Created new chat room:', newRoom?.id);
      return newRoom as ChatRoom;
    } catch (error) {
      this.handleError(error, 'Get/Create Chat Room');
      return null;
    }
  }

  async updateRoomUnreadCount(roomId: string, increment: number = 1): Promise<void> {
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
            updated_at: new Date().toISOString(),
            unread_count: room.unread_count + increment
          })
          .eq('id', roomId);
      }
    } catch (error) {
      this.handleError(error, 'Update Room Unread Count');
    }
  }
}

export const chatRoomService = new ChatRoomService();

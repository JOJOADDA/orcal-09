
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom } from '@/types/database';
import { ChatRoomValidationService } from './ChatRoomValidationService';

export class ChatRoomDataService {
  async getExistingRoom(orderId: string): Promise<ChatRoom | null> {
    try {
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      return existingRoom as ChatRoom;
    } catch (error) {
      ChatRoomValidationService.handleError(error, 'Get Existing Room');
      return null;
    }
  }

  async createNewRoom(orderId: string, clientId: string, adminId?: string): Promise<ChatRoom | null> {
    try {
      const roomData: any = {
        order_id: orderId,
        client_id: clientId,
        admin_id: adminId || null,
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
        throw createError;
      }

      console.log('Created new chat room:', newRoom?.id);
      return newRoom as ChatRoom;
    } catch (error) {
      ChatRoomValidationService.handleError(error, 'Create New Room');
      return null;
    }
  }

  async updateRoomAdmin(roomId: string, adminId: string): Promise<ChatRoom | null> {
    try {
      const { data: updatedRoom, error: updateError } = await supabase
        .from('chat_rooms')
        .update({ admin_id: adminId })
        .eq('id', roomId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log('Chat room admin_id updated successfully');
      return updatedRoom as ChatRoom;
    } catch (error) {
      ChatRoomValidationService.handleError(error, 'Update Room Admin');
      return null;
    }
  }

  async getOrderData(orderId: string): Promise<{ client_id: string } | null> {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('design_orders')
        .select('client_id')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        throw orderError || new Error('Order data not found');
      }

      return orderData;
    } catch (error) {
      ChatRoomValidationService.handleError(error, 'Get Order Data');
      return null;
    }
  }

  async updateUnreadCount(roomId: string, increment: number = 1): Promise<void> {
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
      ChatRoomValidationService.handleError(error, 'Update Room Unread Count');
    }
  }
}

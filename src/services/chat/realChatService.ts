
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, ChatMessage, DesignOrder, Profile } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealChatService {
  private static instance: RealChatService;
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  static getInstance(): RealChatService {
    if (!RealChatService.instance) {
      RealChatService.instance = new RealChatService();
    }
    return RealChatService.instance;
  }

  private handleError(error: any, context: string) {
    console.error(`[RealChatService ${context}] Error:`, error);
    return error;
  }

  // إنشاء أو جلب غرفة الدردشة
  async getOrCreateChatRoom(orderId: string, clientId: string, adminId?: string): Promise<ChatRoom | null> {
    try {
      console.log('Getting/Creating chat room for order:', orderId);
      
      // محاولة جلب الغرفة الموجودة
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existingRoom && !fetchError) {
        console.log('Found existing chat room:', existingRoom.id);
        return existingRoom as ChatRoom;
      }

      // إنشاء غرفة جديدة
      const roomData = {
        order_id: orderId,
        client_id: clientId,
        admin_id: adminId || null,
        unread_count: 0,
        is_active: true
      };

      console.log('Creating new chat room with data:', roomData);

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

  // جلب جميع الرسائل لطلب معين
  async getMessagesByOrderId(orderId: string): Promise<ChatMessage[]> {
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

      const messages = data.map(message => ({
        ...message,
        sender_role: message.sender_role as 'client' | 'admin' | 'designer' | 'system',
        message_type: message.message_type as 'text' | 'file' | 'system'
      })) as ChatMessage[];

      console.log('Messages fetched successfully:', messages.length);
      return messages;
    } catch (error) {
      this.handleError(error, 'Get Messages By Order');
      return [];
    }
  }

  // إرسال رسالة
  async sendMessage(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'designer' | 'system';
    content: string;
    message_type?: 'text' | 'file' | 'system';
  }): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    try {
      console.log('=== SENDING MESSAGE ===');
      console.log('Sender:', messageData.sender_name, 'Role:', messageData.sender_role);
      console.log('Order ID:', messageData.order_id);
      console.log('Content:', messageData.content.substring(0, 100) + '...');
      
      // التأكد من وجود غرفة الدردشة
      const { data: order } = await supabase
        .from('design_orders')
        .select('client_id')
        .eq('id', messageData.order_id)
        .single();

      if (!order) {
        return { success: false, error: { message: 'Order not found' } };
      }

      const room = await this.getOrCreateChatRoom(
        messageData.order_id, 
        order.client_id,
        messageData.sender_role === 'admin' ? messageData.sender_id : undefined
      );
      
      if (!room) {
        return { success: false, error: { message: 'Failed to get or create chat room' } };
      }

      console.log('Using chat room:', room.id);

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

      // تحديث غرفة الدردشة
      await supabase
        .from('chat_rooms')
        .update({
          updated_at: new Date().toISOString(),
          unread_count: room.unread_count + 1
        })
        .eq('id', room.id);

      console.log('=== MESSAGE SENT SUCCESSFULLY ===');
      return { success: true, message: data as ChatMessage };
    } catch (error) {
      console.error('Unexpected error in sendMessage:', error);
      return { success: false, error: this.handleError(error, 'Send Message') };
    }
  }

  // الاشتراك في الرسائل الجديدة
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void): (() => void) | null {
    try {
      console.log('Setting up real-time subscription for order:', orderId);
      
      const channelName = `messages-${orderId}`;
      
      // إغلاق القناة الموجودة إن وجدت
      if (this.activeChannels.has(channelName)) {
        this.activeChannels.get(channelName)?.unsubscribe();
        this.activeChannels.delete(channelName);
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `order_id=eq.${orderId}`
          },
          (payload) => {
            console.log('Real-time message received:', payload.new);
            
            if (!payload.new || typeof payload.new !== 'object') {
              console.warn('Invalid message payload received:', payload);
              return;
            }

            const messageData = payload.new as any;
            
            const message = {
              ...messageData,
              sender_role: (messageData.sender_role || 'client') as 'client' | 'admin' | 'designer' | 'system',
              message_type: (messageData.message_type || 'text') as 'text' | 'file' | 'system'
            } as ChatMessage;
            
            callback(message);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Real-time connection established for order:', orderId);
          }
        });

      this.activeChannels.set(channelName, channel);

      return () => {
        console.log('Unsubscribing from real-time messages for order:', orderId);
        channel.unsubscribe();
        this.activeChannels.delete(channelName);
      };
    } catch (error) {
      this.handleError(error, 'Subscribe To Messages');
      return null;
    }
  }

  // تحديد الرسائل كمقروءة
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

  // تنظيف الاشتراكات
  cleanup() {
    console.log('Cleaning up all real-time subscriptions...');
    this.activeChannels.forEach((channel, name) => {
      console.log('Unsubscribing from channel:', name);
      channel.unsubscribe();
    });
    this.activeChannels.clear();
    console.log('All subscriptions cleaned up successfully');
  }
}

export const realChatService = RealChatService.getInstance();

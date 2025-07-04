
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  private handleError(error: any, context: string) {
    console.error(`[RealtimeService ${context}] Error:`, error);
    return error;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void): (() => void) | null {
    try {
      console.log('=== Setting up optimized real-time subscription ===');
      console.log('Order ID:', orderId);
      
      if (!this.isValidUUID(orderId)) {
        console.error('Invalid order ID format for subscription:', orderId);
        return null;
      }
      
      const channelName = `messages-${orderId}`;
      
      // إغلاق القناة الموجودة إن وجدت (تحسين الذاكرة)
      if (this.activeChannels.has(channelName)) {
        console.log('Closing existing channel:', channelName);
        this.activeChannels.get(channelName)?.unsubscribe();
        this.activeChannels.delete(channelName);
      }

      const channel = supabase
        .channel(channelName, {
          config: {
            presence: { key: orderId },
            broadcast: { self: false, ack: false }, 
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `order_id=eq.${orderId}`
          },
          (payload) => {
            console.log('=== Optimized real-time message received ===');
            
            if (!payload.new || typeof payload.new !== 'object') {
              console.warn('Invalid message payload received:', payload);
              return;
            }

            const messageData = payload.new as any;
            
            // تحسين معالجة البيانات
            const message: ChatMessage = {
              id: messageData.id,
              order_id: messageData.order_id,
              room_id: messageData.room_id,
              sender_id: messageData.sender_id,
              sender_name: messageData.sender_name,
              sender_role: (messageData.sender_role || 'client') as 'client' | 'admin' | 'designer' | 'system',
              content: messageData.content,
              message_type: (messageData.message_type || 'text') as 'text' | 'file' | 'system',
              is_read: messageData.is_read || false,
              created_at: messageData.created_at
            };
            
            console.log('Processed optimized message:', message.id);
            callback(message);
          }
        )
        .subscribe((status) => {
          console.log('Optimized subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Optimized real-time connection established for order:', orderId);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Optimized real-time channel error for order:', orderId);
          }
        });

      this.activeChannels.set(channelName, channel);
      console.log('Optimized real-time subscription set up successfully');

      return () => {
        console.log('Unsubscribing from optimized real-time messages for order:', orderId);
        channel.unsubscribe();
        this.activeChannels.delete(channelName);
      };
    } catch (error) {
      this.handleError(error, 'Subscribe To Messages');
      return null;
    }
  }

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

export const realtimeService = new RealtimeService();

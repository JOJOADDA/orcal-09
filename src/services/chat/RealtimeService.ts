
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
      console.log('=== Setting up real-time subscription ===');
      console.log('Order ID:', orderId);
      
      if (!this.isValidUUID(orderId)) {
        console.error('Invalid order ID format for subscription:', orderId);
        return null;
      }
      
      const channelName = `messages-${orderId}`;
      
      // إغلاق القناة الموجودة إن وجدت
      if (this.activeChannels.has(channelName)) {
        console.log('Closing existing channel:', channelName);
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
            console.log('=== Real-time message received ===');
            console.log('Payload:', payload);
            
            if (!payload.new || typeof payload.new !== 'object') {
              console.warn('Invalid message payload received:', payload);
              return;
            }

            const messageData = payload.new as any;
            console.log('Message data:', messageData);
            
            const message = {
              ...messageData,
              sender_role: (messageData.sender_role || 'client') as 'client' | 'admin' | 'designer' | 'system',
              message_type: (messageData.message_type || 'text') as 'text' | 'file' | 'system'
            } as ChatMessage;
            
            console.log('Processed message:', message);
            callback(message);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Real-time connection established for order:', orderId);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Real-time channel error for order:', orderId);
          }
        });

      this.activeChannels.set(channelName, channel);
      console.log('Real-time subscription set up successfully');

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

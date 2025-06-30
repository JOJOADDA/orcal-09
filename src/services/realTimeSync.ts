
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { DesignOrder, ChatMessage } from '@/types/database';

export class RealTimeSyncService {
  private static instance: RealTimeSyncService;
  private channels: Map<string, RealtimeChannel> = new Map();

  static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService();
    }
    return RealTimeSyncService.instance;
  }

  // مزامنة الطلبات في الوقت الفعلي
  subscribeToOrderUpdates(callback: (order: DesignOrder) => void): (() => void) | null {
    try {
      const channelName = 'orders-sync';
      
      if (this.channels.has(channelName)) {
        this.channels.get(channelName)?.unsubscribe();
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'design_orders'
          },
          (payload) => {
            console.log('Order update received:', payload);
            const order = {
              ...payload.new,
              status: payload.new.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
              priority: payload.new.priority as 'low' | 'medium' | 'high'
            } as DesignOrder;
            callback(order);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);

      return () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      };
    } catch (error) {
      console.error('Error subscribing to order updates:', error);
      return null;
    }
  }

  // مزامنة الرسائل عبر جميع الطلبات
  subscribeToAllMessages(callback: (message: ChatMessage & { order_id: string }) => void): (() => void) | null {
    try {
      const channelName = 'all-messages-sync';
      
      if (this.channels.has(channelName)) {
        this.channels.get(channelName)?.unsubscribe();
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages'
          },
          (payload) => {
            console.log('New message received across system:', payload.new);
            const message = {
              ...payload.new,
              sender_role: payload.new.sender_role as 'client' | 'admin' | 'designer' | 'system',
              message_type: payload.new.message_type as 'text' | 'file' | 'system'
            } as ChatMessage & { order_id: string };
            callback(message);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);

      return () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      };
    } catch (error) {
      console.error('Error subscribing to all messages:', error);
      return null;
    }
  }

  // تنظيف جميع الاشتراكات
  cleanup() {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance();

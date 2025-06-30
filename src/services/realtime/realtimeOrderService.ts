
import { supabase } from '@/integrations/supabase/client';
import { DesignOrder } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeOrderService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private orderCallbacks: Map<string, (orders: DesignOrder[]) => void> = new Map();

  // Subscribe to real-time order updates
  subscribeToOrders(
    subscriptionId: string,
    callback: (orders: DesignOrder[]) => void,
    userRole?: 'client' | 'designer' | 'admin',
    userId?: string
  ): RealtimeChannel {
    console.log('Setting up real-time subscription for orders:', subscriptionId);
    
    // Store callback for this subscription
    this.orderCallbacks.set(subscriptionId, callback);

    const channel = supabase
      .channel(`orders-${subscriptionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'design_orders'
        },
        async (payload) => {
          console.log('Real-time order update received:', payload);
          
          // Refresh orders data when any change occurs
          await this.refreshOrders(subscriptionId, userRole, userId);
        }
      )
      .subscribe((status) => {
        console.log('Order subscription status:', status);
      });

    this.channels.set(subscriptionId, channel);
    return channel;
  }

  // Refresh orders and call the callback
  private async refreshOrders(
    subscriptionId: string, 
    userRole?: 'client' | 'designer' | 'admin',
    userId?: string
  ) {
    try {
      let query = supabase.from('design_orders').select('*');
      
      // Apply filtering based on user role
      if (userRole === 'client' && userId) {
        query = query.eq('client_id', userId);
      }
      // Designers and admins can see all orders (handled by RLS)
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      const orders = data?.map(order => ({
        ...order,
        status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
        priority: order.priority as 'low' | 'medium' | 'high'
      })) as DesignOrder[] || [];

      const callback = this.orderCallbacks.get(subscriptionId);
      if (callback) {
        callback(orders);
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  }

  // Unsubscribe from real-time updates
  unsubscribe(subscriptionId: string) {
    const channel = this.channels.get(subscriptionId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(subscriptionId);
      this.orderCallbacks.delete(subscriptionId);
      console.log('Unsubscribed from orders:', subscriptionId);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel, id) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.orderCallbacks.clear();
    console.log('Unsubscribed from all order channels');
  }
}

export const realtimeOrderService = new RealtimeOrderService();

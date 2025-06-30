
import { supabase } from '@/integrations/supabase/client';
import { DesignOrder } from '@/types/database';
import { CacheService } from '../cache/cacheService';

export class OrderService extends CacheService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

  async createOrder(orderData: {
    client_id: string;
    client_name: string;
    client_phone: string;
    design_type: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    total_price?: number;
  }) {
    try {
      console.log('Creating order:', orderData);
      
      const { data, error } = await supabase
        .from('design_orders')
        .insert(orderData)
        .select()
        .single();

      if (data && !error) {
        console.log('Order created successfully:', data.id);
        this.clearCache('orders');
        this.clearCache('statistics');
      }

      return { data: data as DesignOrder, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Create Order') };
    }
  }

  async getOrdersByClientId(clientId: string): Promise<DesignOrder[]> {
    try {
      const cacheKey = `orders_client_${clientId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching orders for client:', clientId);
      
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get Orders By Client');
        return [];
      }
      
      const orders = data.map(order => ({
        ...order,
        status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
        priority: order.priority as 'low' | 'medium' | 'high'
      })) as DesignOrder[];

      this.setCache(cacheKey, orders);
      console.log('Orders fetched successfully:', orders.length);
      return orders;
    } catch (error) {
      this.handleError(error, 'Get Orders By Client');
      return [];
    }
  }

  async getAllOrders(): Promise<DesignOrder[]> {
    try {
      const cacheKey = 'all_orders';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching all orders');
      
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get All Orders');
        return [];
      }
      
      const orders = data.map(order => ({
        ...order,
        status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
        priority: order.priority as 'low' | 'medium' | 'high'
      })) as DesignOrder[];

      this.setCache(cacheKey, orders);
      console.log('All orders fetched successfully:', orders.length);
      return orders;
    } catch (error) {
      this.handleError(error, 'Get All Orders');
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'in-progress' | 'completed' | 'delivered') {
    try {
      console.log('Updating order status:', orderId, status);
      
      const { data, error } = await supabase
        .from('design_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (!error) {
        console.log('Order status updated successfully');
        this.clearCache('orders');
        this.clearCache('statistics');
      }

      return { data: data as DesignOrder, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Order Status') };
    }
  }

  async updateOrder(orderId: string, updates: Partial<DesignOrder>) {
    try {
      const { data, error } = await supabase
        .from('design_orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (!error) {
        this.clearCache('orders');
      }

      return { data: data as DesignOrder, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Order') };
    }
  }

  async deleteOrder(orderId: string) {
    try {
      const { error } = await supabase
        .from('design_orders')
        .delete()
        .eq('id', orderId);

      if (!error) {
        this.clearCache('orders');
        this.clearCache('statistics');
      }

      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'Delete Order') };
    }
  }
}

export const orderService = new OrderService();

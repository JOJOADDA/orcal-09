import { supabase } from '@/integrations/supabase/client';
import { DesignOrder } from '@/types/database';

export class OrderDesignerService {
  private handleError(error: any, context: string) {
    console.error(`[OrderDesignerService ${context}] Error:`, error);
    return error;
  }

  /**
   * التأكد من أن المصمم يمكنه الوصول لجميع الطلبات
   */
  async getAllOrdersForDesigner(): Promise<DesignOrder[]> {
    try {
      console.log('Fetching all orders for designer');
      
      // التحقق من أن المستخدم مصمم
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        return [];
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'designer') {
        console.error('User is not a designer');
        return [];
      }

      // استخدام الدالة المحسنة للحصول على جميع الطلبات
      const { data, error } = await supabase.rpc('get_all_orders_for_designers');

      if (error) {
        this.handleError(error, 'Get All Orders For Designer');
        return [];
      }

      const orders = data?.map(order => ({
        ...order,
        status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
        priority: order.priority as 'low' | 'medium' | 'high'
      })) as DesignOrder[] || [];

      console.log('Fetched orders for designer:', orders.length);
      return orders;
    } catch (error) {
      this.handleError(error, 'Get All Orders For Designer');
      return [];
    }
  }

  /**
   * تحديث حالة الطلب من قبل المصمم
   */
  async updateOrderStatusByDesigner(
    orderId: string, 
    status: 'pending' | 'in-progress' | 'completed' | 'delivered'
  ): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('Designer updating order status:', orderId, status);
      
      // التحقق من أن المستخدم مصمم
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: { message: 'يجب تسجيل الدخول' } };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'designer') {
        return { success: false, error: { message: 'غير مصرح للمستخدم بتحديث الطلبات' } };
      }

      // تحديث حالة الطلب
      const { data, error } = await supabase
        .from('design_orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error };
      }

      console.log('Order status updated successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating order status:', error);
      return { success: false, error: this.handleError(error, 'Update Order Status By Designer') };
    }
  }

  /**
   * الحصول على إحصائيات الطلبات للمصمم
   */
  async getOrderStatistics(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    delivered: number;
  }> {
    try {
      const orders = await this.getAllOrdersForDesigner();
      
      return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        inProgress: orders.filter(o => o.status === 'in-progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        delivered: orders.filter(o => o.status === 'delivered').length
      };
    } catch (error) {
      this.handleError(error, 'Get Order Statistics');
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        delivered: 0
      };
    }
  }

  /**
   * البحث في الطلبات
   */
  async searchOrders(searchTerm: string): Promise<DesignOrder[]> {
    try {
      const allOrders = await this.getAllOrdersForDesigner();
      
      if (!searchTerm.trim()) {
        return allOrders;
      }

      const searchLower = searchTerm.toLowerCase();
      return allOrders.filter(order =>
        order.client_name.toLowerCase().includes(searchLower) ||
        order.design_type.toLowerCase().includes(searchLower) ||
        order.description.toLowerCase().includes(searchLower) ||
        order.client_phone.includes(searchTerm)
      );
    } catch (error) {
      this.handleError(error, 'Search Orders');
      return [];
    }
  }

  /**
   * تصفية الطلبات حسب الحالة
   */
  async filterOrdersByStatus(status?: string): Promise<DesignOrder[]> {
    try {
      const allOrders = await this.getAllOrdersForDesigner();
      
      if (!status || status === 'all') {
        return allOrders;
      }

      return allOrders.filter(order => order.status === status);
    } catch (error) {
      this.handleError(error, 'Filter Orders By Status');
      return [];
    }
  }
}

export const orderDesignerService = new OrderDesignerService();
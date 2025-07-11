import { supabase } from '@/integrations/supabase/client';

export class OrderManagementService {
  // إنشاء طلب جديد
  static async createOrder(orderData: {
    client_name: string;
    client_phone: string;
    design_type: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'المستخدم غير مسجل الدخول' };
      }

      const { data, error } = await supabase
        .from('design_orders')
        .insert({
          client_id: user.user.id,
          ...orderData,
          priority: orderData.priority || 'medium'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
      }

      return { success: true, orderId: data.id };
    } catch (error) {
      console.error('Unexpected error creating order:', error);
      return { success: false, error: 'حدث خطأ في إنشاء الطلب' };
    }
  }

  // الحصول على جميع الطلبات (للإدارة)
  static async getAllOrders(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
      return [];
    }
  }

  // تحديث حالة الطلب
  static async updateOrderStatus(
    orderId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('design_orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating order status:', error);
      return { success: false, error: 'حدث خطأ في تحديث حالة الطلب' };
    }
  }

  // تخصيص مصمم للطلب
  static async assignDesigner(
    orderId: string, 
    designerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('design_orders')
        .update({ 
          assigned_designer_id: designerId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error assigning designer:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error assigning designer:', error);
      return { success: false, error: 'حدث خطأ في تخصيص المصمم' };
    }
  }

  // الحصول على طلبات عميل محدد
  static async getClientOrders(clientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching client orders:', error);
      return [];
    }
  }

  // الحصول على طلبات مصمم محدد
  static async getDesignerOrders(designerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .eq('assigned_designer_id', designerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching designer orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching designer orders:', error);
      return [];
    }
  }

  // حذف طلب
  static async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('design_orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error deleting order:', error);
      return { success: false, error: 'حدث خطأ في حذف الطلب' };
    }
  }

  // الحصول على المصممين المتاحين
  static async getAvailableDesigners(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching designers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching designers:', error);
      return [];
    }
  }

  // الحصول على مهام طلب معين
  static async getOrderTasks(orderId: string): Promise<OrderTask[]> {
    try {
      const { data, error } = await supabase
        .from('order_tasks')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching order tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching order tasks:', error);
      return [];
    }
  }

  // إنشاء مهمة جديدة
  static async createTask(taskData: {
    order_id: string;
    task_name: string;
    task_description?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    estimated_hours?: number;
    due_date?: string;
    assigned_to?: string;
  }): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'المستخدم غير مسجل الدخول' };
      }

      const { data, error } = await supabase
        .from('order_tasks')
        .insert({
          ...taskData,
          created_by: user.user.id,
          priority: taskData.priority || 'medium'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return { success: false, error: error.message };
      }

      return { success: true, taskId: data.id };
    } catch (error) {
      console.error('Unexpected error creating task:', error);
      return { success: false, error: 'حدث خطأ في إنشاء المهمة' };
    }
  }
}

// تعريف نوع OrderTask
export interface OrderTask {
  id: string;
  order_id: string;
  task_name: string;
  task_description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export const orderManagementService = new OrderManagementService();
import { supabase } from '@/integrations/supabase/client';

export interface OrderStage {
  id: string;
  order_id: string;
  stage_name: string;
  stage_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  assigned_designer_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderTask {
  id: string;
  order_id: string;
  stage_id: string;
  task_name: string;
  task_description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface DesignerActivity {
  id: string;
  designer_id: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  current_capacity: number;
  current_orders_count: number;
  specializations: string[];
  available_from?: string;
  available_until?: string;
  last_activity: string;
}

export class OrderManagementService {
  // إنشاء مراحل طلب جديد تلقائياً
  static async createOrderStages(orderId: string, designType: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Creating order stages for:', orderId, designType);

      // تحديد المراحل حسب نوع التصميم
      const stages = this.getStagesByDesignType(designType);
      
      const stageRecords = stages.map((stage, index) => ({
        order_id: orderId,
        stage_name: stage.name,
        stage_order: index + 1,
        status: 'pending' as const,
        estimated_duration_hours: stage.estimatedHours
      }));

      const { error } = await supabase
        .from('order_stages')
        .insert(stageRecords);

      if (error) {
        console.error('Error creating order stages:', error);
        return { success: false, error: error.message };
      }

      console.log('Order stages created successfully');
      return { success: true };
    } catch (error) {
      console.error('Unexpected error creating order stages:', error);
      return { success: false, error: 'حدث خطأ في إنشاء مراحل الطلب' };
    }
  }

  // الحصول على مراحل الطلب
  static async getOrderStages(orderId: string): Promise<OrderStage[]> {
    try {
      const { data, error } = await supabase
        .from('order_stages')
        .select('*')
        .eq('order_id', orderId)
        .order('stage_order', { ascending: true });

      if (error) {
        console.error('Error fetching order stages:', error);
        return [];
      }

      return data as OrderStage[];
    } catch (error) {
      console.error('Unexpected error fetching order stages:', error);
      return [];
    }
  }

  // تحديث حالة المرحلة
  static async updateStageStatus(
    stageId: string, 
    status: OrderStage['status'], 
    designerId?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
        if (designerId) updateData.assigned_designer_id = designerId;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (notes) updateData.notes = notes;

      const { error } = await supabase
        .from('order_stages')
        .update(updateData)
        .eq('id', stageId);

      if (error) {
        console.error('Error updating stage status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating stage status:', error);
      return { success: false, error: 'حدث خطأ في تحديث حالة المرحلة' };
    }
  }

  // إنشاء مهمة جديدة
  static async createTask(taskData: Partial<OrderTask>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('order_tasks')
        .insert(taskData);

      if (error) {
        console.error('Error creating task:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error creating task:', error);
      return { success: false, error: 'حدث خطأ في إنشاء المهمة' };
    }
  }

  // الحصول على مهام الطلب
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

      return data as OrderTask[];
    } catch (error) {
      console.error('Unexpected error fetching order tasks:', error);
      return [];
    }
  }

  // تحديث نشاط المصمم
  static async updateDesignerActivity(
    designerId: string,
    status: DesignerActivity['status'],
    capacity?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        status,
        last_activity: new Date().toISOString()
      };

      if (capacity !== undefined) {
        updateData.current_capacity = capacity;
      }

      const { error } = await supabase
        .from('designer_activity')
        .upsert({
          designer_id: designerId,
          ...updateData
        });

      if (error) {
        console.error('Error updating designer activity:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating designer activity:', error);
      return { success: false, error: 'حدث خطأ في تحديث نشاط المصمم' };
    }
  }

  // الحصول على المصممين المتاحين
  static async getAvailableDesigners(): Promise<DesignerActivity[]> {
    try {
      const { data, error } = await supabase
        .from('designer_activity')
        .select(`
          *,
          profiles!designer_activity_designer_id_fkey(name, role)
        `)
        .in('status', ['online', 'away'])
        .lt('current_capacity', 80)
        .order('current_capacity', { ascending: true });

      if (error) {
        console.error('Error fetching available designers:', error);
        return [];
      }

      return data as DesignerActivity[];
    } catch (error) {
      console.error('Unexpected error fetching available designers:', error);
      return [];
    }
  }

  // توزيع الطلب تلقائياً على مصمم متاح
  static async assignOrderToDesigner(orderId: string, designType: string): Promise<{ success: boolean; designerId?: string; error?: string }> {
    try {
      const availableDesigners = await this.getAvailableDesigners();
      
      if (availableDesigners.length === 0) {
        return { success: false, error: 'لا يوجد مصممين متاحين حالياً' };
      }

      // اختيار المصمم الأقل تحميلاً
      const selectedDesigner = availableDesigners[0];

      // تحديث حالة المصمم
      await this.updateDesignerActivity(
        selectedDesigner.designer_id,
        'busy',
        selectedDesigner.current_capacity + 20
      );

      // تحديث الطلب بالمصمم المخصص
      const { error: updateError } = await supabase
        .from('design_orders')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error assigning order to designer:', updateError);
        return { success: false, error: updateError.message };
      }

      // تحديث المرحلة الأولى
      const stages = await this.getOrderStages(orderId);
      if (stages.length > 0) {
        await this.updateStageStatus(stages[0].id, 'in_progress', selectedDesigner.designer_id);
      }

      return { success: true, designerId: selectedDesigner.designer_id };
    } catch (error) {
      console.error('Unexpected error assigning order to designer:', error);
      return { success: false, error: 'حدث خطأ في تخصيص الطلب للمصمم' };
    }
  }

  // تحديد المراحل حسب نوع التصميم
  private static getStagesByDesignType(designType: string): Array<{name: string; estimatedHours: number}> {
    const stageTemplates: Record<string, Array<{name: string; estimatedHours: number}>> = {
      'logo': [
        { name: 'تحليل المتطلبات', estimatedHours: 2 },
        { name: 'البحث والإلهام', estimatedHours: 3 },
        { name: 'الرسوم الأولية', estimatedHours: 4 },
        { name: 'التصميم النهائي', estimatedHours: 6 },
        { name: 'المراجعة والتعديلات', estimatedHours: 4 },
        { name: 'التسليم النهائي', estimatedHours: 1 }
      ],
      'business_card': [
        { name: 'تحليل المتطلبات', estimatedHours: 1 },
        { name: 'تجميع المحتوى', estimatedHours: 2 },
        { name: 'التصميم الأولي', estimatedHours: 3 },
        { name: 'المراجعة والتعديلات', estimatedHours: 2 },
        { name: 'التسليم النهائي', estimatedHours: 1 }
      ],
      'website': [
        { name: 'تحليل المتطلبات', estimatedHours: 4 },
        { name: 'تخطيط الموقع', estimatedHours: 6 },
        { name: 'تصميم الواجهات', estimatedHours: 12 },
        { name: 'التطوير', estimatedHours: 20 },
        { name: 'الاختبار', estimatedHours: 4 },
        { name: 'التسليم النهائي', estimatedHours: 2 }
      ],
      'default': [
        { name: 'تحليل المتطلبات', estimatedHours: 2 },
        { name: 'التصميم الأولي', estimatedHours: 4 },
        { name: 'المراجعة والتعديلات', estimatedHours: 3 },
        { name: 'التسليم النهائي', estimatedHours: 1 }
      ]
    };

    return stageTemplates[designType] || stageTemplates['default'];
  }
}

export const orderManagementService = new OrderManagementService();
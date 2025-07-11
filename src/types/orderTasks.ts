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
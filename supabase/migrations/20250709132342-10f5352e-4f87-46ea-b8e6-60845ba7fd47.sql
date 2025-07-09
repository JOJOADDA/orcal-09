-- تطوير نظام إدارة متكامل - المرحلة الأولى

-- جدول تتبع مراحل الطلبات المتقدم
CREATE TABLE public.order_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES design_orders(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration_hours INTEGER,
  actual_duration_hours INTEGER,
  assigned_designer_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول المهام الفرعية للمصممين
CREATE TABLE public.order_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES design_orders(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES order_stages(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  assigned_to UUID REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول نظام الإشعارات
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- info, success, warning, error, task, deadline
  related_order_id UUID REFERENCES design_orders(id),
  related_task_id UUID REFERENCES order_tasks(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, critical
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول إعدادات الإشعارات للمستخدمين
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  notification_types JSONB NOT NULL DEFAULT '{"task": true, "deadline": true, "order_update": true, "chat": true}',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول إحصائيات المصممين
CREATE TABLE public.designer_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  orders_completed INTEGER DEFAULT 0,
  orders_in_progress INTEGER DEFAULT 0,
  total_hours_worked DECIMAL(5,2) DEFAULT 0,
  average_completion_time_hours DECIMAL(5,2),
  client_satisfaction_score DECIMAL(3,2), -- 0 to 5.00
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  on_time_delivery_rate DECIMAL(3,2) DEFAULT 0, -- percentage
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(designer_id, date)
);

-- جدول نشاط المصممين الحالي
CREATE TABLE public.designer_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline', -- online, offline, busy, away
  current_capacity INTEGER NOT NULL DEFAULT 0, -- 0-100 percentage
  current_orders_count INTEGER NOT NULL DEFAULT 0,
  specializations TEXT[] DEFAULT '{}',
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(designer_id)
);

-- تمكين RLS على جميع الجداول
ALTER TABLE public.order_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designer_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designer_activity ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للطلبات والمراحل
CREATE POLICY "Users can view order stages for their orders" ON order_stages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM design_orders 
    WHERE id = order_id AND (
      client_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'designer'))
    )
  )
);

CREATE POLICY "Designers and admins can manage order stages" ON order_stages
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'designer'))
);

-- سياسات RLS للمهام
CREATE POLICY "Users can view tasks for their orders" ON order_tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM design_orders 
    WHERE id = order_id AND (
      client_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'designer'))
    )
  )
);

CREATE POLICY "Designers can manage their assigned tasks" ON order_tasks
FOR ALL USING (
  assigned_to = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسات RLS للإشعارات
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
FOR INSERT WITH CHECK (true);

-- سياسات RLS لإعدادات الإشعارات
CREATE POLICY "Users can manage their notification settings" ON notification_settings
FOR ALL USING (user_id = auth.uid());

-- سياسات RLS لإحصائيات المصممين
CREATE POLICY "Designers can view their own stats" ON designer_stats
FOR SELECT USING (
  designer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can manage designer stats" ON designer_stats
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- سياسات RLS لنشاط المصممين
CREATE POLICY "Users can view designer activity" ON designer_activity
FOR SELECT USING (
  designer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'designer'))
);

CREATE POLICY "Designers can update their own activity" ON designer_activity
FOR ALL USING (
  designer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- إنشاء indexes للأداء
CREATE INDEX idx_order_stages_order_id ON order_stages(order_id);
CREATE INDEX idx_order_stages_status ON order_stages(status);
CREATE INDEX idx_order_tasks_order_id ON order_tasks(order_id);
CREATE INDEX idx_order_tasks_assigned_to ON order_tasks(assigned_to);
CREATE INDEX idx_order_tasks_status ON order_tasks(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_designer_stats_designer_date ON designer_stats(designer_id, date);
CREATE INDEX idx_designer_activity_status ON designer_activity(status);

-- تحديث trigger للتواريخ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_order_stages_updated_at BEFORE UPDATE ON order_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_tasks_updated_at BEFORE UPDATE ON order_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designer_stats_updated_at BEFORE UPDATE ON designer_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designer_activity_updated_at BEFORE UPDATE ON designer_activity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
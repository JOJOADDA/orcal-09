-- إنشاء جداول الملفات المفقودة
CREATE TABLE IF NOT EXISTS public.order_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type file_type NOT NULL DEFAULT 'document',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public.message_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type file_type NOT NULL DEFAULT 'document',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول المهام
CREATE TABLE IF NOT EXISTS public.order_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  estimated_hours INTEGER DEFAULT 0,
  actual_hours INTEGER DEFAULT 0,
  assigned_to UUID,
  created_by UUID NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS للجداول الجديدة
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tasks ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول ملفات الطلبات
CREATE POLICY "Users can view order files they have access to" 
ON public.order_files FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.design_orders 
    WHERE client_id = auth.uid() 
    OR assigned_designer_id IN (
      SELECT id FROM public.designers WHERE user_id = auth.uid()
    )
  ) OR is_admin_or_designer()
);

CREATE POLICY "Users can upload files to their orders" 
ON public.order_files FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid() AND
  order_id IN (
    SELECT id FROM public.design_orders 
    WHERE client_id = auth.uid() 
    OR assigned_designer_id IN (
      SELECT id FROM public.designers WHERE user_id = auth.uid()
    )
  ) OR is_admin_or_designer()
);

-- سياسات RLS لجدول ملفات الرسائل
CREATE POLICY "Users can view message files they have access to" 
ON public.message_files FOR SELECT
USING (
  message_id IN (
    SELECT id FROM public.chat_messages
    WHERE room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE client_id = auth.uid() 
      OR admin_id = auth.uid()
      OR designer_id IN (
        SELECT id FROM public.designers WHERE user_id = auth.uid()
      )
    )
  ) OR is_admin_or_designer()
);

CREATE POLICY "Users can upload message files" 
ON public.message_files FOR INSERT
WITH CHECK (
  message_id IN (
    SELECT id FROM public.chat_messages
    WHERE sender_id = auth.uid()
  )
);

-- سياسات RLS لجدول المهام
CREATE POLICY "Users can view tasks for their orders" 
ON public.order_tasks FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.design_orders 
    WHERE client_id = auth.uid() 
    OR assigned_designer_id IN (
      SELECT id FROM public.designers WHERE user_id = auth.uid()
    )
  ) OR is_admin_or_designer()
);

CREATE POLICY "Admins and designers can manage tasks" 
ON public.order_tasks FOR ALL
USING (is_admin_or_designer());

-- إنشاء triggers للحفاظ على updated_at
CREATE TRIGGER update_order_files_updated_at
  BEFORE UPDATE ON public.order_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_files_updated_at
  BEFORE UPDATE ON public.message_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_tasks_updated_at
  BEFORE UPDATE ON public.order_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON public.order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_order_files_uploaded_by ON public.order_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_message_files_message_id ON public.message_files(message_id);
CREATE INDEX IF NOT EXISTS idx_order_tasks_order_id ON public.order_tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tasks_assigned_to ON public.order_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_order_tasks_status ON public.order_tasks(status);

-- إنشاء storage bucket للملفات
INSERT INTO storage.buckets (id, name, public) VALUES ('order-files', 'order-files', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage
CREATE POLICY "Anyone can view order files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'order-files');

CREATE POLICY "Authenticated users can upload order files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'order-files' AND auth.role() = 'authenticated');

-- تفعيل Realtime للجداول الجديدة
ALTER TABLE public.order_files REPLICA IDENTITY FULL;
ALTER TABLE public.message_files REPLICA IDENTITY FULL;
ALTER TABLE public.order_tasks REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.order_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_tasks;
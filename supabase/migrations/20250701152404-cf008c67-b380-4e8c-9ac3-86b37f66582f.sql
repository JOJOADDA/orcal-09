-- تحسين نظام المصممين والطلبات لضمان أن جميع المصممين يمكنهم الوصول لجميع الطلبات

-- أولاً: تحديث سياسات RLS لجدول design_orders لتسمح لجميع المصممين برؤية جميع الطلبات
DROP POLICY IF EXISTS "Designers can view assigned orders" ON public.design_orders;
DROP POLICY IF EXISTS "Designers can update assigned orders" ON public.design_orders;

-- إنشاء سياسات جديدة محسنة للمصممين
CREATE POLICY "All designers can view all orders" 
ON public.design_orders 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'designer'
));

CREATE POLICY "All designers can update any order status" 
ON public.design_orders 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'designer'
));

-- تحسين سياسات chat_rooms لضمان أن المصممين يمكنهم الوصول لجميع غرف الدردشة
DROP POLICY IF EXISTS "Users can view chat rooms for their orders" ON public.chat_rooms;

CREATE POLICY "Designers can view all chat rooms" 
ON public.chat_rooms 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() = client_id) OR 
  (auth.uid() = admin_id) OR 
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'designer')
  ))
);

-- تحسين سياسات chat_messages لضمان أن المصممين يمكنهم إرسال رسائل لأي طلب
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.chat_messages;

CREATE POLICY "Authenticated users can send messages to accessible rooms" 
ON public.chat_messages 
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.uid() = sender_id) AND 
  (EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.room_id 
    AND (
      chat_rooms.client_id = auth.uid() OR 
      chat_rooms.admin_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'designer')
      )
    )
  ))
);

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_order_id ON public.chat_rooms(order_id);
CREATE INDEX IF NOT EXISTS idx_design_orders_status ON public.design_orders(status);

-- إنشاء دالة محسنة للتحقق من صلاحيات المصمم
CREATE OR REPLACE FUNCTION public.is_designer(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'designer'
  );
$$;

-- دالة للحصول على جميع الطلبات للمصممين
CREATE OR REPLACE FUNCTION public.get_all_orders_for_designers()
RETURNS TABLE (
  id uuid,
  client_id uuid,
  client_name text,
  client_phone text,
  design_type text,
  description text,
  status text,
  priority text,
  total_price integer,
  estimated_delivery timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    o.id,
    o.client_id,
    o.client_name,
    o.client_phone,
    o.design_type,
    o.description,
    o.status,
    o.priority,
    o.total_price,
    o.estimated_delivery,
    o.created_at,
    o.updated_at
  FROM public.design_orders o
  WHERE public.is_designer() = true
  ORDER BY o.created_at DESC;
$$;
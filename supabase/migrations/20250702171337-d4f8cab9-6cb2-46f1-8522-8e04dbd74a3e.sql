-- تحديث chat_room الموجودة لتتضمن admin_id للمصممين
UPDATE public.chat_rooms 
SET admin_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.role = 'designer' 
  LIMIT 1
)
WHERE admin_id IS NULL;

-- إضافة RLS policies محدثة للرسائل لضمان رؤية المصممين للرسائل
DROP POLICY IF EXISTS "Designers can view all messages" ON public.chat_messages;
CREATE POLICY "Designers can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'designer'
  )
);

-- إضافة policy للمصممين لإرسال الرسائل
DROP POLICY IF EXISTS "Designers can send messages" ON public.chat_messages;
CREATE POLICY "Designers can send messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'designer'
  )
);

-- تحديث policy للرسائل الواردة للعملاء
DROP POLICY IF EXISTS "Clients can view their messages" ON public.chat_messages;
CREATE POLICY "Clients can view their messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.design_orders 
    WHERE id = order_id AND client_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'designer')
  )
);
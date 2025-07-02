-- التحقق من constraint الحالي وتحديثه لدعم دور المصمم
-- أولاً إزالة constraint القديم
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_role_check;

-- إضافة constraint جديد يدعم جميع الأدوار المطلوبة
ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_sender_role_check 
CHECK (sender_role IN ('client', 'admin', 'designer', 'system'));

-- التأكد من أن message_type صحيح أيضاً
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_message_type_check 
CHECK (message_type IN ('text', 'file', 'system'));
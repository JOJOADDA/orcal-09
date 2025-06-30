
-- حذف جميع البيانات المرتبطة بالطلبات والدردشة
-- البدء بحذف الملفات المرتبطة بالرسائل
DELETE FROM public.message_files;

-- حذف جميع الرسائل
DELETE FROM public.chat_messages;

-- حذف جميع غرف الدردشة
DELETE FROM public.chat_rooms;

-- حذف جميع ملفات الطلبات
DELETE FROM public.order_files;

-- حذف جميع طلبات التصميم
DELETE FROM public.design_orders;

-- إعادة تعيين التسلسل التلقائي للجداول (إذا كان موجوداً)
-- هذا سيضمن أن المعرفات تبدأ من جديد
ALTER SEQUENCE IF EXISTS chat_rooms_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS chat_messages_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS design_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_files_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS message_files_id_seq RESTART WITH 1;

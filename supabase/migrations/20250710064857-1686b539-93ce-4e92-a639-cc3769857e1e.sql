-- Add tables to existing publication for real-time
ALTER PUBLICATION supabase_realtime 
ADD TABLE public.profiles, public.designers, public.design_orders, 
public.order_files, public.chat_rooms, public.chat_messages, 
public.message_files, public.order_tasks, public.notifications, 
public.notification_settings;
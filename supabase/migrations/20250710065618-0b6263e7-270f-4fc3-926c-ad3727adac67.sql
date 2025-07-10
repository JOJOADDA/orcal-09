-- Enable real-time for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.designers REPLICA IDENTITY FULL;
ALTER TABLE public.design_orders REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.notification_settings REPLICA IDENTITY FULL;

-- Add tables to existing publication for real-time
ALTER PUBLICATION supabase_realtime 
ADD TABLE public.profiles, public.designers, public.design_orders, 
public.chat_rooms, public.chat_messages, public.notifications, 
public.notification_settings;
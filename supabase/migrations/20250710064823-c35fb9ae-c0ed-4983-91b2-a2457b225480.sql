-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'designer');

-- Create priority enum (fixed values)
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create status enums
CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'completed', 'delivered', 'cancelled');
CREATE TYPE public.designer_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.message_type AS ENUM ('text', 'file', 'system');
CREATE TYPE public.notification_type AS ENUM ('info', 'success', 'warning', 'error', 'task', 'deadline');
CREATE TYPE public.file_type AS ENUM ('image', 'document', 'design');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  role app_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create designers table
CREATE TABLE public.designers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  portfolio_url TEXT,
  status designer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create design_orders table
CREATE TABLE public.design_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  design_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  assigned_designer_id UUID REFERENCES public.designers(id),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  total_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_files table
CREATE TABLE public.order_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type file_type NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  designer_id UUID REFERENCES public.designers(id),
  unread_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role app_role NOT NULL,
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_files table
CREATE TABLE public.message_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type file_type NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_tasks table
CREATE TABLE public.order_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table (fixed priority default)
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  related_order_id UUID REFERENCES public.design_orders(id),
  related_task_id UUID REFERENCES public.order_tasks(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  priority priority_level NOT NULL DEFAULT 'medium',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  notification_types JSONB NOT NULL DEFAULT '{"task": true, "deadline": true, "order_update": true, "chat": true}',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
DECLARE
  user_role app_role;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
  RETURN COALESCE(user_role, 'client');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check if user is admin or designer
CREATE OR REPLACE FUNCTION public.is_admin_or_designer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_user_role() IN ('admin', 'designer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and designers can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_or_designer());

-- Create RLS policies for designers
CREATE POLICY "Anyone can view active designers" ON public.designers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Designers can update their own profile" ON public.designers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can register as designer" ON public.designers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all designers" ON public.designers
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for design_orders
CREATE POLICY "Clients can view their own orders" ON public.design_orders
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can create orders" ON public.design_orders
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their own orders" ON public.design_orders
  FOR UPDATE USING (client_id = auth.uid());

CREATE POLICY "Admins and designers can view all orders" ON public.design_orders
  FOR ALL USING (public.is_admin_or_designer());

CREATE POLICY "Assigned designers can update orders" ON public.design_orders
  FOR UPDATE USING (
    assigned_designer_id IN (
      SELECT id FROM public.designers WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for order_files
CREATE POLICY "Order participants can view files" ON public.order_files
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.design_orders 
      WHERE client_id = auth.uid() 
      OR assigned_designer_id IN (
        SELECT id FROM public.designers WHERE user_id = auth.uid()
      )
    ) OR public.is_admin_or_designer()
  );

CREATE POLICY "Order participants can upload files" ON public.order_files
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM public.design_orders 
      WHERE client_id = auth.uid() 
      OR assigned_designer_id IN (
        SELECT id FROM public.designers WHERE user_id = auth.uid()
      )
    ) OR public.is_admin_or_designer()
  );

-- Create RLS policies for chat_rooms
CREATE POLICY "Chat participants can view rooms" ON public.chat_rooms
  FOR SELECT USING (
    client_id = auth.uid() 
    OR admin_id = auth.uid() 
    OR designer_id IN (
      SELECT id FROM public.designers WHERE user_id = auth.uid()
    )
    OR public.is_admin_or_designer()
  );

CREATE POLICY "Admins can manage chat rooms" ON public.chat_rooms
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Clients can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Create RLS policies for chat_messages
CREATE POLICY "Chat participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    room_id IN (
      SELECT id FROM public.chat_rooms 
      WHERE client_id = auth.uid() 
      OR admin_id = auth.uid() 
      OR designer_id IN (
        SELECT id FROM public.designers WHERE user_id = auth.uid()
      )
    ) OR public.is_admin_or_designer()
  );

CREATE POLICY "Chat participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() 
    AND room_id IN (
      SELECT id FROM public.chat_rooms 
      WHERE client_id = auth.uid() 
      OR admin_id = auth.uid() 
      OR designer_id IN (
        SELECT id FROM public.designers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage all messages" ON public.chat_messages
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for message_files
CREATE POLICY "Message participants can view files" ON public.message_files
  FOR SELECT USING (
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
    ) OR public.is_admin_or_designer()
  );

CREATE POLICY "Message senders can upload files" ON public.message_files
  FOR INSERT WITH CHECK (
    message_id IN (
      SELECT id FROM public.chat_messages WHERE sender_id = auth.uid()
    )
  );

-- Create RLS policies for order_tasks
CREATE POLICY "Task participants can view tasks" ON public.order_tasks
  FOR SELECT USING (
    assigned_to = auth.uid() 
    OR order_id IN (
      SELECT id FROM public.design_orders WHERE client_id = auth.uid()
    )
    OR public.is_admin_or_designer()
  );

CREATE POLICY "Admins can manage all tasks" ON public.order_tasks
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Assigned users can update tasks" ON public.order_tasks
  FOR UPDATE USING (assigned_to = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Create RLS policies for notification_settings
CREATE POLICY "Users can manage their notification settings" ON public.notification_settings
  FOR ALL USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designers_updated_at
  BEFORE UPDATE ON public.designers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_design_orders_updated_at
  BEFORE UPDATE ON public.design_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_tasks_updated_at
  BEFORE UPDATE ON public.order_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email, 'مستخدم جديد'),
    'client'
  );
  
  -- Create default notification settings
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically create chat room when order is created
CREATE OR REPLACE FUNCTION public.create_chat_room_for_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chat_rooms (order_id, client_id)
  VALUES (NEW.id, NEW.client_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic chat room creation
CREATE TRIGGER create_chat_room_on_order
  AFTER INSERT ON public.design_orders
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_room_for_order();

-- Create function to give admin role to all designers
CREATE OR REPLACE FUNCTION public.make_designer_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile to make designer an admin
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically make designers admins
CREATE TRIGGER make_designer_admin_trigger
  AFTER INSERT ON public.designers
  FOR EACH ROW EXECUTE FUNCTION public.make_designer_admin();

-- Enable real-time for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.designers REPLICA IDENTITY FULL;
ALTER TABLE public.design_orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_files REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_files REPLICA IDENTITY FULL;
ALTER TABLE public.order_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.notification_settings REPLICA IDENTITY FULL;

-- Create publication for real-time
CREATE PUBLICATION supabase_realtime 
FOR TABLE public.profiles, public.designers, public.design_orders, 
public.order_files, public.chat_rooms, public.chat_messages, 
public.message_files, public.order_tasks, public.notifications, 
public.notification_settings;
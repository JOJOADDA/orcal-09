
-- Phase 1: Implement comprehensive RLS policies for all tables

-- First, create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_order_participant(order_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.design_orders 
    WHERE id = order_id AND (
      client_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'designer'))
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Enable RLS on all tables (some may already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Profiles table policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Design orders policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.design_orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.design_orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.design_orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.design_orders;

CREATE POLICY "Users can view their own orders" ON public.design_orders
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins and designers can view all orders" ON public.design_orders
  FOR SELECT USING (public.get_current_user_role() IN ('admin', 'designer'));

CREATE POLICY "Users can create their own orders" ON public.design_orders
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can update all orders" ON public.design_orders
  FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Designers can update assigned orders" ON public.design_orders
  FOR UPDATE USING (public.get_current_user_role() = 'designer');

-- Order files policies  
DROP POLICY IF EXISTS "Users can view order files" ON public.order_files;
DROP POLICY IF EXISTS "Users can upload order files" ON public.order_files;

CREATE POLICY "Users can view order files" ON public.order_files
  FOR SELECT USING (public.is_order_participant(order_id));

CREATE POLICY "Users can upload order files" ON public.order_files
  FOR INSERT WITH CHECK (public.is_order_participant(order_id) AND auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own files" ON public.order_files
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Chat rooms policies
DROP POLICY IF EXISTS "Users can view their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can update their chat rooms" ON public.chat_rooms;

CREATE POLICY "Users can view their chat rooms" ON public.chat_rooms
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = admin_id OR
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (
    auth.uid() = client_id OR 
    public.get_current_user_role() IN ('admin', 'designer')
  );

CREATE POLICY "Users can update their chat rooms" ON public.chat_rooms
  FOR UPDATE USING (
    auth.uid() = client_id OR 
    auth.uid() = admin_id OR
    public.get_current_user_role() = 'admin'
  );

-- Chat messages policies
DROP POLICY IF EXISTS "Users can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.chat_messages;

CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (
        client_id = auth.uid() OR 
        admin_id = auth.uid() OR
        public.get_current_user_role() = 'admin'
      )
    )
  );

CREATE POLICY "Users can send messages to their rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (
        client_id = auth.uid() OR 
        admin_id = auth.uid() OR
        public.get_current_user_role() = 'admin'
      )
    )
  );

CREATE POLICY "Users can update their own messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Message files policies
DROP POLICY IF EXISTS "Users can view message files" ON public.message_files;
DROP POLICY IF EXISTS "Users can upload message files" ON public.message_files;

CREATE POLICY "Users can view message files" ON public.message_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_rooms cr ON cm.room_id = cr.id
      WHERE cm.id = message_id AND (
        cr.client_id = auth.uid() OR 
        cr.admin_id = auth.uid() OR
        public.get_current_user_role() = 'admin'
      )
    )
  );

CREATE POLICY "Users can upload message files" ON public.message_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_rooms cr ON cm.room_id = cr.id
      WHERE cm.id = message_id AND cm.sender_id = auth.uid()
    )
  );

-- Add designers table RLS if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'designers') THEN
    ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Designers can view their own profile" ON public.designers;
    DROP POLICY IF EXISTS "Designers can update their own profile" ON public.designers;
    DROP POLICY IF EXISTS "Admins can view all designers" ON public.designers;
    DROP POLICY IF EXISTS "Admins can update designer status" ON public.designers;
    DROP POLICY IF EXISTS "Public can view active designers" ON public.designers;
    
    CREATE POLICY "Designers can view their own profile" ON public.designers
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY "Designers can update their own profile" ON public.designers
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY "Admins can view all designers" ON public.designers
      FOR SELECT USING (public.get_current_user_role() = 'admin');
      
    CREATE POLICY "Admins can update designer status" ON public.designers
      FOR UPDATE USING (public.get_current_user_role() = 'admin');
      
    CREATE POLICY "Public can view active designers" ON public.designers
      FOR SELECT USING (status = 'active');
  END IF;
END $$;

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.security_audit_log
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit_log (user_id, action, resource_type, resource_id)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

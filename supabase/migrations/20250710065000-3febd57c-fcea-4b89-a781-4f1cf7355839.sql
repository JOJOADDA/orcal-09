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
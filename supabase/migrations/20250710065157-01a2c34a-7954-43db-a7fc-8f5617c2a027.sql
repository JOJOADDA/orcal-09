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
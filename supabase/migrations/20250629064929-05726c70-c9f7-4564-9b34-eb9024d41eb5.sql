
-- إنشاء جدول الملفات الشخصية للمستخدمين
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- إنشاء جدول الطلبات
CREATE TABLE public.design_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  design_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'delivered')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  total_price INTEGER
);

-- إنشاء جدول ملفات الطلبات
CREATE TABLE public.order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'design')),
  size_bytes INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- إنشاء جدول غرف الدردشة
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id),
  unread_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(order_id)
);

-- إنشاء جدول الرسائل
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin', 'system')),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- إنشاء جدول ملفات الرسائل
CREATE TABLE public.message_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'design')),
  size_bytes INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- تفعيل Row Level Security على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان للملفات الشخصية
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
  
CREATE POLICY "Anyone can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- إنشاء سياسات الأمان للطلبات
CREATE POLICY "Users can view their own orders" ON public.design_orders
  FOR SELECT USING (auth.uid() = client_id);
  
CREATE POLICY "Admins can view all orders" ON public.design_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
  
CREATE POLICY "Users can create their own orders" ON public.design_orders
  FOR INSERT WITH CHECK (auth.uid() = client_id);
  
CREATE POLICY "Admins can update all orders" ON public.design_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- إنشاء سياسات الأمان لملفات الطلبات
CREATE POLICY "Users can view order files" ON public.order_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.design_orders 
      WHERE id = order_id AND (client_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );
  
CREATE POLICY "Users can upload order files" ON public.order_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_orders 
      WHERE id = order_id AND (client_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- إنشاء سياسات الأمان لغرف الدردشة
CREATE POLICY "Users can view their chat rooms" ON public.chat_rooms
  FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = admin_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  
CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = client_id);
  
CREATE POLICY "Users can update their chat rooms" ON public.chat_rooms
  FOR UPDATE USING (
    auth.uid() = client_id OR auth.uid() = admin_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- إنشاء سياسات الأمان للرسائل
CREATE POLICY "Users can view chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (client_id = auth.uid() OR admin_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  
CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (client_id = auth.uid() OR admin_id = auth.uid())
    )
  );
  
CREATE POLICY "Users can update their messages" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (client_id = auth.uid() OR admin_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- إنشاء سياسات الأمان لملفات الرسائل
CREATE POLICY "Users can view message files" ON public.message_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_rooms cr ON cm.room_id = cr.id
      WHERE cm.id = message_id AND (cr.client_id = auth.uid() OR cr.admin_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
  
CREATE POLICY "Users can upload message files" ON public.message_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_rooms cr ON cm.room_id = cr.id
      WHERE cm.id = message_id AND (cr.client_id = auth.uid() OR cr.admin_id = auth.uid())
    )
  );

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    
CREATE TRIGGER update_design_orders_updated_at BEFORE UPDATE ON public.design_orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- إنشاء trigger لإنشاء ملف شخصي تلقائياً عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- إنشاء بucket للتخزين
INSERT INTO storage.buckets (id, name, public) VALUES ('order-files', 'order-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('message-files', 'message-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- إنشاء سياسات التخزين
CREATE POLICY "Anyone can view files" ON storage.objects FOR SELECT USING (bucket_id IN ('order-files', 'message-files', 'avatars'));
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('order-files', 'message-files', 'avatars'));
CREATE POLICY "Users can update their files" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id IN ('order-files', 'message-files', 'avatars'));
CREATE POLICY "Users can delete their files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id IN ('order-files', 'message-files', 'avatars'));

-- إنشاء مستخدم أدمن افتراضي (سيتم إنشاؤه عند أول تسجيل دخول كأدمن)
-- هذا سيتم التعامل معه في الكود

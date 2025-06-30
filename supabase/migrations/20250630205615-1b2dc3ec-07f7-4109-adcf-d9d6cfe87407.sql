
-- إنشاء جدول غرف الدردشة إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  admin_id UUID,
  unread_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(order_id)
);

-- إنشاء جدول الرسائل إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.design_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin', 'designer', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول ملفات الرسائل إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.message_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'document', 'design')),
  size_bytes INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_chat_rooms_order_id ON public.chat_rooms(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order_id ON public.chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- تفعيل Real-time للجداول
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- إضافة الجداول لـ Real-time publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.chat_rooms, public.chat_messages;

-- إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON public.chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- إنشاء سياسات الأمان (RLS)
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;

-- سياسات غرف الدردشة
DROP POLICY IF EXISTS "Users can view their chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can view their chat rooms" ON public.chat_rooms
  FOR SELECT USING (
    client_id = auth.uid() OR 
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (
    client_id = auth.uid() OR 
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update their chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can update their chat rooms" ON public.chat_rooms
  FOR UPDATE USING (
    client_id = auth.uid() OR 
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- سياسات الرسائل
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (
        client_id = auth.uid() OR 
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.chat_messages;
CREATE POLICY "Users can send messages to their rooms" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (
        client_id = auth.uid() OR 
        admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- سياسات ملفات الرسائل
DROP POLICY IF EXISTS "Users can view message files" ON public.message_files;
CREATE POLICY "Users can view message files" ON public.message_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_rooms cr ON cm.room_id = cr.id
      WHERE cm.id = message_id AND (
        cr.client_id = auth.uid() OR 
        cr.admin_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "Users can upload message files" ON public.message_files;
CREATE POLICY "Users can upload message files" ON public.message_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.chat_rooms cr ON cm.room_id = cr.id
      WHERE cm.id = message_id AND cm.sender_id = auth.uid()
    )
  );

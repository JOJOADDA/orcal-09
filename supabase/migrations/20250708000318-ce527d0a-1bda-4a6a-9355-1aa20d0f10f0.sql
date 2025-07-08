-- إزالة السياسات المتضاربة وإنشاء سياسات محسنة للدردشة
DROP POLICY IF EXISTS "Authenticated users can send messages to accessible rooms" ON chat_messages;
DROP POLICY IF EXISTS "Designers can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages for their orders" ON chat_messages;

-- سياسة شاملة ومحسنة لإرسال الرسائل
CREATE POLICY "Enhanced users can send messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND 
  (
    -- العملاء يمكنهم إرسال رسائل لطلباتهم
    EXISTS (
      SELECT 1 FROM design_orders 
      WHERE id = order_id AND client_id = auth.uid()
    ) OR
    -- المصممين والإدارة يمكنهم إرسال رسائل لأي طلب
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'designer')
    )
  )
);

-- تحسين سياسة عرض الرسائل للمصممين
DROP POLICY IF EXISTS "Designers can view all messages" ON chat_messages;
DROP POLICY IF EXISTS "Clients can view their messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages for their orders" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON chat_messages;

-- سياسة شاملة لعرض الرسائل
CREATE POLICY "Enhanced users can view messages"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  -- العملاء يمكنهم رؤية رسائل طلباتهم
  EXISTS (
    SELECT 1 FROM design_orders 
    WHERE id = order_id AND client_id = auth.uid()
  ) OR
  -- المصممين والإدارة يمكنهم رؤية جميع الرسائل
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'designer')
  ) OR
  -- أعضاء الغرفة يمكنهم رؤية رسائلها
  EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE id = room_id AND (client_id = auth.uid() OR admin_id = auth.uid())
  )
);

-- تحسين سياسات chat_rooms للمصممين
DROP POLICY IF EXISTS "Designers can view all chat rooms" ON chat_rooms;

CREATE POLICY "Enhanced chat room access"
ON chat_rooms
FOR SELECT
TO authenticated
USING (
  client_id = auth.uid() OR 
  admin_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'designer')
  )
);

-- إضافة index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_role ON chat_messages(sender_id, sender_role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order_created ON chat_messages(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role IN ('admin', 'designer');

-- التأكد من أن trigger التحديث التلقائي يعمل
CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET updated_at = NOW()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chat_room_on_message ON chat_messages;
CREATE TRIGGER update_chat_room_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_timestamp();
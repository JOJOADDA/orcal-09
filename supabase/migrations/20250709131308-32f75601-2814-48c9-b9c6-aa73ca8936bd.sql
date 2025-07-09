-- إصلاح نهائي وشامل لمشكلة المصممين

-- أولاً: تحديث جميع المصممين في جدول profiles للتأكد من الدور الصحيح
UPDATE profiles 
SET role = 'designer' 
WHERE id IN (
  SELECT user_id FROM designers WHERE is_active = true
);

-- ثانياً: التأكد من تفعيل جميع المصممين
UPDATE designers 
SET is_active = true, is_verified = true 
WHERE is_active = false OR is_verified = false;

-- ثالثاً: إزالة السياسة الحالية وإنشاء سياسة جديدة مبسطة ومضمونة
DROP POLICY IF EXISTS "Enhanced users can send messages" ON chat_messages;

-- سياسة مبسطة وفعالة للإرسال
CREATE POLICY "Designers and clients can send messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND (
    -- العملاء يمكنهم إرسال رسائل لطلباتهم
    (sender_role = 'client' AND EXISTS (
      SELECT 1 FROM design_orders 
      WHERE id = order_id AND client_id = auth.uid()
    )) OR
    -- المصممين يمكنهم إرسال رسائل لأي طلب
    (sender_role = 'designer' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'designer'
    )) OR
    -- الإدارة يمكنها إرسال رسائل لأي طلب
    (sender_role = 'admin' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  )
);

-- رابعاً: إنشاء view محسن للمصممين النشطين
CREATE OR REPLACE VIEW active_designers AS
SELECT 
  p.id,
  p.name,
  p.role,
  d.email,
  d.phone,
  d.specialization,
  d.is_active,
  d.is_verified
FROM profiles p
JOIN designers d ON p.id = d.user_id
WHERE p.role = 'designer' AND d.is_active = true AND d.is_verified = true;

-- خامساً: function للتحقق السريع من دور المصمم
CREATE OR REPLACE FUNCTION is_active_designer(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM active_designers 
    WHERE id = user_id
  );
$$;

-- سادساً: إضافة trigger لضمان تطابق البيانات
CREATE OR REPLACE FUNCTION sync_designer_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- عند إضافة مصمم جديد، تحديث role في profiles
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE profiles 
    SET role = 'designer'
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_designer_profile_trigger ON designers;
CREATE TRIGGER sync_designer_profile_trigger
  AFTER INSERT OR UPDATE ON designers
  FOR EACH ROW
  EXECUTE FUNCTION sync_designer_profile();

-- سابعاً: تحديث فوري لجميع البيانات الموجودة
DO $$
BEGIN
  -- التأكد من تطابق جميع المصممين
  UPDATE profiles 
  SET role = 'designer' 
  WHERE id IN (SELECT user_id FROM designers);
  
  -- تفعيل جميع المصممين
  UPDATE designers 
  SET is_active = true, is_verified = true;
  
  RAISE NOTICE 'Designer sync completed successfully';
END $$;
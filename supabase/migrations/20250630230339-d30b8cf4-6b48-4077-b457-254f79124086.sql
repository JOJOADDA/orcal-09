
-- أولاً تحديث أي بيانات موجودة بدور 'designer' إلى 'client'
UPDATE public.profiles SET role = 'client' WHERE role = 'designer';

-- الآن يمكننا إزالة جدول designers والسياسات المرتبطة به
DROP POLICY IF EXISTS "Designers can view their own profile" ON public.designers;
DROP POLICY IF EXISTS "Designers can update their own profile" ON public.designers;
DROP POLICY IF EXISTS "Admins can view all designers" ON public.designers;
DROP POLICY IF EXISTS "Admins can update designer status" ON public.designers;

-- إزالة الترايجر المرتبط بجدول designers
DROP TRIGGER IF EXISTS update_designers_updated_at ON public.designers;

-- حذف جدول designers
DROP TABLE IF EXISTS public.designers;

-- تحديث دالة handle_new_user لإزالة المنطق الخاص بالمصممين
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- إنشاء ملف تعريف في جدول profiles للجميع
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$;

-- تحديث قيود جدول profiles لإزالة دور المصمم
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'admin'));

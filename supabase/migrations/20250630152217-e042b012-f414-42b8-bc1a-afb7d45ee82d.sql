
-- إصلاح مشكلة إنشاء حسابات المصممين
-- أولاً: إزالة التكرار في triggers والدوال

-- حذف الترايجر المكرر للمصممين
DROP TRIGGER IF EXISTS on_auth_designer_created ON auth.users;

-- حذف الدالة المكررة للمصممين
DROP FUNCTION IF EXISTS public.handle_new_designer();

-- تحديث دالة handle_new_user لتتعامل مع جميع أنواع المستخدمين بشكل صحيح
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
  
  -- إنشاء ملف تعريف إضافي في جدول designers إذا كان المستخدم مصمماً
  IF NEW.raw_user_meta_data->>'role' = 'designer' THEN
    INSERT INTO public.designers (user_id, name, email, phone, specialization, experience_years, portfolio_url, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'مصمم جديد'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'تصميم عام'),
      COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 0),
      COALESCE(NEW.raw_user_meta_data->>'portfolio_url', ''),
      'pending'
    ) ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      specialization = EXCLUDED.specialization,
      experience_years = EXCLUDED.experience_years,
      portfolio_url = EXCLUDED.portfolio_url;
  END IF;
  
  RETURN NEW;
END;
$$;

-- التأكد من وجود الترايجر بشكل صحيح
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- حذف السياسات الموجودة وإنشاؤها من جديد
DROP POLICY IF EXISTS "Designers can view their own profile" ON public.designers;
DROP POLICY IF EXISTS "Designers can update their own profile" ON public.designers;
DROP POLICY IF EXISTS "Admins can view all designers" ON public.designers;
DROP POLICY IF EXISTS "Admins can update designer status" ON public.designers;

-- إضافة سياسات RLS للمصممين
CREATE POLICY "Designers can view their own profile" 
  ON public.designers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Designers can update their own profile" 
  ON public.designers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- السماح للمدراء بعرض جميع المصممين
CREATE POLICY "Admins can view all designers" 
  ON public.designers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- السماح للمدراء بتحديث حالة المصممين
CREATE POLICY "Admins can update designer status" 
  ON public.designers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- تمكين RLS على جدول المصممين
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

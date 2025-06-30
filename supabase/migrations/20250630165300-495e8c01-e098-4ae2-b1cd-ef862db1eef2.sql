
-- إصلاح جدول profiles لضمان إنشاء الملفات الشخصية بشكل صحيح
ALTER TABLE public.profiles 
ALTER COLUMN phone DROP NOT NULL;

-- تحديث دالة handle_new_user لتعمل بشكل أفضل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إنشاء ملف تعريف في جدول profiles
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  ) ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', profiles.phone),
    role = COALESCE(NEW.raw_user_meta_data->>'role', profiles.role),
    updated_at = NOW();
  
  -- إنشاء ملف تعريف إضافي في جدول designers إذا كان المستخدم مصمماً
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'designer' THEN
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
      portfolio_url = EXCLUDED.portfolio_url,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- تسجيل الخطأ والمتابعة لتجنب فشل إنشاء المستخدم
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- التأكد من وجود المحفز
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_designers_user_id ON public.designers(user_id);
CREATE INDEX IF NOT EXISTS idx_designers_email ON public.designers(email);

-- تنظيف البيانات المكررة أو الفاسدة
DELETE FROM public.designers WHERE user_id IS NULL;
DELETE FROM public.profiles WHERE name IS NULL OR name = '';

-- إصلاح أي ملفات شخصية مفقودة للمستخدمين الموجودين
INSERT INTO public.profiles (id, name, phone, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'مستخدم'),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'client')
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;


-- تحديث قيود جدول profiles لتشمل دور المصمم
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'admin', 'designer'));

-- تحديث دالة إنشاء المستخدم الجديد لدعم المصممين
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
  );
  
  -- إنشاء ملف تعريف إضافي في جدول designers إذا كان المستخدم مصمماً
  IF NEW.raw_user_meta_data->>'role' = 'designer' THEN
    INSERT INTO public.designers (user_id, name, email, phone, specialization, experience_years, portfolio_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'مصمم جديد'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'تصميم عام'),
      COALESCE((NEW.raw_user_meta_data->>'experience_years')::integer, 0),
      COALESCE(NEW.raw_user_meta_data->>'portfolio_url', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- حذف الترايجر القديم وإنشاء واحد جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

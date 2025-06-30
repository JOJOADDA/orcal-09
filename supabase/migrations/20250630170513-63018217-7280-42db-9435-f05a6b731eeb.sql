
-- إصلاح دالة handle_new_user وتبسيطها
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إنشاء ملف تعريف بسيط وسريع
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'مستخدم جديد'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- إذا كان الملف موجود، تحديثه فقط
    UPDATE public.profiles 
    SET 
      name = COALESCE(NEW.raw_user_meta_data->>'name', name),
      phone = COALESCE(NEW.raw_user_meta_data->>'phone', phone),
      role = COALESCE(NEW.raw_user_meta_data->>'role', role),
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- تسجيل الخطأ والمتابعة
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- إضافة RLS policies محسنة لجدول profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين بالوصول لملفهم الشخصي فقط
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- السماح بإنشاء الملف الشخصي عند التسجيل
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- تنظيف البيانات المكررة والفاسدة
DELETE FROM public.profiles WHERE name IS NULL OR name = '';

-- إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_profiles_lookup ON public.profiles(id, role);

-- التأكد من وجود المحفز
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

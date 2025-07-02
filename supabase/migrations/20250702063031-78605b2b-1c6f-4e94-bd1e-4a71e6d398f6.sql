-- إضافة المصممين الموجودين حالياً إلى جدول designers
INSERT INTO public.designers (user_id, name, email, is_verified, is_active)
SELECT 
  p.id as user_id,
  p.name,
  (SELECT email FROM auth.users WHERE id = p.id) as email,
  true as is_verified,
  true as is_active
FROM public.profiles p
WHERE p.role = 'designer'
AND NOT EXISTS (
  SELECT 1 FROM public.designers d WHERE d.user_id = p.id
);

-- تحديث دالة التحقق من المصمم لتدعم أيضاً المصممين من جدول profiles
CREATE OR REPLACE FUNCTION public.verify_designer_comprehensive(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- التحقق من وجود المصمم في جدول designers المنفصل
  IF EXISTS(
    SELECT 1 FROM public.designers 
    WHERE email = p_email AND is_active = true AND is_verified = true
  ) THEN
    RETURN true;
  END IF;
  
  -- التحقق من وجود المصمم في جدول profiles للمستخدمين الموجودين
  IF EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE u.email = p_email AND p.role = 'designer'
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- دالة للحصول على بيانات المصمم الشاملة
CREATE OR REPLACE FUNCTION public.get_designer_comprehensive(p_email TEXT)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER,
  portfolio_url TEXT,
  is_verified BOOLEAN,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- أولاً جرب جدول designers
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    d.name,
    d.email,
    d.phone,
    d.specialization,
    d.experience_years,
    d.portfolio_url,
    d.is_verified,
    d.is_active
  FROM public.designers d
  WHERE d.email = p_email AND d.is_active = true;
  
  -- إذا لم نجد نتائج، جرب جدول profiles
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      gen_random_uuid() as id,
      p.id as user_id,
      p.name,
      u.email,
      p.phone,
      'تصميم عام'::TEXT as specialization,
      0 as experience_years,
      NULL::TEXT as portfolio_url,
      true as is_verified,
      true as is_active
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE u.email = p_email AND p.role = 'designer';
  END IF;
END;
$$;
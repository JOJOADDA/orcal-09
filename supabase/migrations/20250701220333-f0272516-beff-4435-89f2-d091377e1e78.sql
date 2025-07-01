-- إنشاء جدول منفصل للمصممين
CREATE TABLE public.designers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER DEFAULT 0,
  portfolio_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS للجدول
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان للمصممين
CREATE POLICY "Admins can view all designers" 
ON public.designers 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Designers can view their own profile" 
ON public.designers 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can update designers" 
ON public.designers 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Designers can update their own profile" 
ON public.designers 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can create designers" 
ON public.designers 
FOR INSERT 
WITH CHECK (true);

-- إنشاء فهرس للبحث السريع
CREATE INDEX idx_designers_email ON public.designers(email);
CREATE INDEX idx_designers_user_id ON public.designers(user_id);

-- دالة للتحقق من وجود إيميل في النظام
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  client_exists BOOLEAN;
  designer_exists BOOLEAN;
BEGIN
  -- التحقق من وجود الإيميل في جدول العملاء
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE email = p_email AND 
    id IN (SELECT id FROM public.profiles WHERE role = 'client')
  ) INTO client_exists;
  
  -- التحقق من وجود الإيميل في جدول المصممين
  SELECT EXISTS(
    SELECT 1 FROM public.designers WHERE email = p_email
  ) INTO designer_exists;
  
  -- إرجاع النتيجة كـ JSON
  result := json_build_object(
    'exists', (client_exists OR designer_exists),
    'is_client', client_exists,
    'is_designer', designer_exists,
    'email', p_email
  );
  
  RETURN result;
END;
$$;

-- دالة للتحقق من صحة مصمم
CREATE OR REPLACE FUNCTION public.verify_designer(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- التحقق من وجود المصمم وأنه نشط
  RETURN EXISTS(
    SELECT 1 FROM public.designers 
    WHERE email = p_email AND is_active = true
  );
END;
$$;

-- دالة لإضافة مصمم جديد
CREATE OR REPLACE FUNCTION public.add_designer(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_specialization TEXT DEFAULT NULL,
  p_experience_years INTEGER DEFAULT 0,
  p_portfolio_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_designer_id UUID;
  email_check JSON;
BEGIN
  -- التحقق من عدم وجود الإيميل مسبقاً
  email_check := public.check_email_exists(p_email);
  
  IF (email_check->>'exists')::BOOLEAN THEN
    RAISE EXCEPTION 'Email already exists in the system';
  END IF;
  
  -- إضافة المصمم الجديد
  INSERT INTO public.designers (
    name, email, phone, specialization, 
    experience_years, portfolio_url
  ) VALUES (
    p_name, p_email, p_phone, p_specialization, 
    p_experience_years, p_portfolio_url
  ) RETURNING id INTO new_designer_id;
  
  RETURN new_designer_id;
END;
$$;

-- تحديث دالة handle_new_user لمنع تضارب الأدوار
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- الحصول على الدور من metadata
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  
  -- التأكد من أن المستخدم لا يسجل كمصمم وعميل معاً
  IF user_role = 'client' THEN
    -- التحقق من عدم وجود المستخدم كمصمم
    IF EXISTS(SELECT 1 FROM public.designers WHERE email = NEW.email) THEN
      RAISE EXCEPTION 'This email is already registered as a designer';
    END IF;
    
    -- إنشاء ملف تعريف عميل
    INSERT INTO public.profiles (id, name, phone, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'عميل جديد'),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'client'
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_designers_updated_at
BEFORE UPDATE ON public.designers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
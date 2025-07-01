-- إصلاح مشكلة قيود جدول profiles
-- إزالة القيد القديم إذا كان موجوداً وإنشاء قيد جديد يسمح بالأدوار المطلوبة

-- إزالة القيد القديم
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- إنشاء قيد جديد يسمح بالأدوار: client, admin, designer
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('client', 'admin', 'designer'));

-- التأكد من أن الجدول يحتوي على الأعمدة المطلوبة
DO $$
BEGIN
    -- إضافة عمود phone إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    
    -- إضافة عمود avatar_url إذا لم يكن موجوداً
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;
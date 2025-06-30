
-- Create designers table for designer authentication
CREATE TABLE public.designers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  specialization TEXT,
  experience_years INTEGER DEFAULT 0,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for designers table
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

-- Create policies for designers
CREATE POLICY "Designers can view their own profile" 
  ON public.designers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Designers can update their own profile" 
  ON public.designers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_designers_updated_at
  BEFORE UPDATE ON public.designers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new designer registration
CREATE OR REPLACE FUNCTION public.handle_new_designer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create designer profile if role is 'designer'
  IF NEW.raw_user_meta_data->>'role' = 'designer' THEN
    INSERT INTO public.designers (user_id, name, email, phone, specialization)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'مصمم جديد'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'تصميم عام')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new designer users
CREATE TRIGGER on_auth_designer_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_designer();


-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create storage policies for chat files
CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Users can update their chat files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'chat-files' AND auth.uid() = owner);

CREATE POLICY "Users can delete their chat files" ON storage.objects
  FOR DELETE USING (bucket_id = 'chat-files' AND auth.uid() = owner);

-- Update RLS policies for message_files
CREATE POLICY "Users can view message files for their orders" 
  ON public.message_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.design_orders orders ON cm.order_id = orders.id
      WHERE cm.id = message_id 
      AND (orders.client_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'designer')))
    )
  );

CREATE POLICY "Users can create message files for their orders" 
  ON public.message_files 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.design_orders orders ON cm.order_id = orders.id
      WHERE cm.id = message_id 
      AND (orders.client_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'designer')))
    )
  );

-- Enable RLS on message_files table
ALTER TABLE public.message_files ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for order_files
CREATE POLICY "Users can view order files for their orders" 
  ON public.order_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_orders 
      WHERE design_orders.id = order_id 
      AND (design_orders.client_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'designer')))
    )
  );

CREATE POLICY "Users can create order files for their orders" 
  ON public.order_files 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_orders 
      WHERE design_orders.id = order_id 
      AND (design_orders.client_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'designer')))
    )
  );

-- Enable RLS on order_files table
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;

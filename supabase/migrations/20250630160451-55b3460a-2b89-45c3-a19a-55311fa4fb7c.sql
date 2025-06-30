
-- Enable real-time updates for design_orders table
ALTER TABLE public.design_orders REPLICA IDENTITY FULL;

-- Add the design_orders table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_orders;

-- Create proper RLS policies for design_orders table
CREATE POLICY "Clients can view their own orders" 
  ON public.design_orders 
  FOR SELECT 
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own orders" 
  ON public.design_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own orders" 
  ON public.design_orders 
  FOR UPDATE 
  USING (auth.uid() = client_id);

-- Allow designers to view all orders
CREATE POLICY "Designers can view all orders" 
  ON public.design_orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'designer'
    )
  );

-- Allow designers to update order status
CREATE POLICY "Designers can update order status" 
  ON public.design_orders 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'designer'
    )
  );

-- Allow admins to view and manage all orders
CREATE POLICY "Admins can manage all orders" 
  ON public.design_orders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable RLS on design_orders table
ALTER TABLE public.design_orders ENABLE ROW LEVEL SECURITY;

-- Also enable real-time for chat_messages and chat_rooms
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages for their orders" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.design_orders 
      WHERE design_orders.id = order_id 
      AND (design_orders.client_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'designer')))
    )
  );

CREATE POLICY "Users can send messages for their orders" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.design_orders 
      WHERE design_orders.id = order_id 
      AND (design_orders.client_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'designer')))
    )
  );

-- Enable RLS on chat tables
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_rooms
CREATE POLICY "Users can view chat rooms for their orders" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'designer'))
  );

CREATE POLICY "System can create chat rooms" 
  ON public.chat_rooms 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update chat rooms" 
  ON public.chat_rooms 
  FOR UPDATE 
  USING (true);

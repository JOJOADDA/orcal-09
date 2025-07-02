-- تحديث chat_room المحددة لتتضمن المصمم
UPDATE public.chat_rooms 
SET admin_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.role = 'designer' 
  LIMIT 1
)
WHERE order_id = '0d1171eb-88ad-4df9-a8c0-491da77379cf' AND admin_id IS NULL;
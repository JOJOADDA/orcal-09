
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  role: 'client' | 'admin' | 'designer' | 'system';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Designer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience_years: number;
  portfolio_url?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface DesignOrder {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  design_type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  total_price?: number;
}

export interface OrderFile {
  id: string;
  order_id: string;
  name: string;
  url: string;
  file_type: 'image' | 'document' | 'design';
  size_bytes: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface ChatRoom {
  id: string;
  order_id: string;
  client_id: string;
  admin_id?: string;
  unread_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  order_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'client' | 'admin' | 'designer' | 'system';
  content: string;
  message_type: 'text' | 'file' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface MessageFile {
  id: string;
  message_id: string;
  name: string;
  url: string;
  file_type: 'image' | 'document' | 'design';
  size_bytes: number;
  uploaded_at: string;
}

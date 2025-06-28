
export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'client' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface DesignOrder {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  designType: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  files: OrderFile[];
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  totalPrice?: number;
}

export interface OrderFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'design';
  size: number;
  uploadedAt: Date;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'admin';
  content: string;
  type: 'text' | 'file' | 'system';
  files?: OrderFile[];
  timestamp: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  orderId: string;
  clientId: string;
  adminId?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

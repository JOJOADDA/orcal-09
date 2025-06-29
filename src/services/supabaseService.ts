import { supabase } from '@/integrations/supabase/client';
import { Profile, DesignOrder, OrderFile, ChatRoom, ChatMessage, MessageFile } from '@/types/database';

class SupabaseService {
  // Authentication
  async signUp(phone: string, password: string, name: string, role: 'client' | 'admin' = 'client') {
    const { data, error } = await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: {
          name,
          phone,
          role
        }
      }
    });

    // If signup is successful, create profile immediately
    if (data.user && !error) {
      try {
        await this.createProfile(data.user.id, name, phone, role);
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { data, error };
  }

async signIn(phone: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password
  });

  return { data, error };
}

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Profile Management
  async createProfile(userId: string, name: string, phone: string, role: 'client' | 'admin' = 'client') {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        phone,
        role
      })
      .select()
      .single();
    
    return { data: data as Profile, error };
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data: data as Profile, error };
  }

  // Order Management
  async createOrder(orderData: {
    client_id: string;
    client_name: string;
    client_phone: string;
    design_type: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
  }) {
    const { data, error } = await supabase
      .from('design_orders')
      .insert(orderData)
      .select()
      .single();
    
    if (data && !error) {
      await this.createChatRoom(data.id, orderData.client_id);
      return { data: data as DesignOrder, error };
    }
    
    return { data, error };
  }

  async getOrdersByClientId(clientId: string): Promise<DesignOrder[]> {
    const { data, error } = await supabase
      .from('design_orders')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    return (data || []) as DesignOrder[];
  }

  async getAllOrders(): Promise<DesignOrder[]> {
    const { data, error } = await supabase
      .from('design_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
    return (data || []) as DesignOrder[];
  }

  async updateOrderStatus(orderId: string, status: DesignOrder['status']) {
    const { data, error } = await supabase
      .from('design_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (data && !error) {
      await this.sendSystemMessage(orderId, `تم تحديث حالة الطلب إلى: ${this.getStatusText(status)}`);
      return { data: data as DesignOrder, error };
    }
    
    return { data, error };
  }

  private getStatusText(status: DesignOrder['status']): string {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in-progress': 'جاري التنفيذ',
      'completed': 'مكتمل',
      'delivered': 'تم التسليم'
    };
    return statusMap[status];
  }

  // File Management
  async uploadFile(file: File, bucket: string, folder?: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async addOrderFile(orderFile: {
    order_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
    uploaded_by: string;
  }) {
    const { data, error } = await supabase
      .from('order_files')
      .insert(orderFile)
      .select()
      .single();
    
    return { data: data as OrderFile, error };
  }

  async getOrderFiles(orderId: string): Promise<OrderFile[]> {
    const { data, error } = await supabase
      .from('order_files')
      .select('*')
      .eq('order_id', orderId)
      .order('uploaded_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching order files:', error);
      return [];
    }
    return (data || []) as OrderFile[];
  }

  // Chat Management
  async createChatRoom(orderId: string, clientId: string) {
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (existingRoom) return { data: existingRoom as ChatRoom, error: null };

    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        order_id: orderId,
        client_id: clientId
      })
      .select()
      .single();
    
    return { data: data as ChatRoom, error };
  }

  async getChatRoomByOrderId(orderId: string): Promise<ChatRoom | null> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching chat room:', error);
      return null;
    }
    return data as ChatRoom;
  }

  async getAllChatRooms(): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }
    return (data || []) as ChatRoom[];
  }

  async sendMessage(messageData: {
    room_id: string;
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin';
    content: string;
    message_type?: 'text' | 'file';
  }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...messageData,
        message_type: messageData.message_type || 'text'
      })
      .select()
      .single();
    
    if (data && !error) {
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', messageData.room_id);
      
      return { data: data as ChatMessage, error };
    }
    
    return { data, error };
  }

  async sendSystemMessage(orderId: string, content: string) {
    const room = await this.getChatRoomByOrderId(orderId);
    if (!room) return;

    return await this.sendMessage({
      room_id: room.id,
      order_id: orderId,
      sender_id: 'system',
      sender_name: 'النظام',
      sender_role: 'admin',
      content,
      message_type: 'text'
    });
  }

  async getMessagesByOrderId(orderId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return (data || []) as ChatMessage[];
  }

  async markMessagesAsRead(roomId: string, userId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_id', userId);
    
    if (!error) {
      await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('id', roomId);
    }
    
    return { error };
  }

  // Statistics
  async getStatistics() {
    const { data: orders } = await supabase
      .from('design_orders')
      .select('status, client_id');
    
    if (!orders) return {
      totalOrders: 0,
      pendingOrders: 0,
      inProgressOrders: 0,
      completedOrders: 0,
      activeClients: 0
    };

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const inProgressOrders = orders.filter(o => o.status === 'in-progress').length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
    const activeClients = new Set(orders.map(o => o.client_id)).size;

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      activeClients
    };
  }

  // Real-time subscriptions
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => callback(payload.new as ChatMessage)
      )
      .subscribe();
  }

  subscribeToOrderUpdates(callback: (order: DesignOrder) => void) {
    return supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'design_orders'
        },
        (payload) => callback(payload.new as DesignOrder)
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();

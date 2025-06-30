
import { supabase } from '@/integrations/supabase/client';
import { Profile, DesignOrder, OrderFile, ChatRoom, ChatMessage, MessageFile } from '@/types/database';

class SupabaseService {
  // Authentication
  async signUp(identifier: string, password: string, name: string, phone: string = '') {
    const isEmail = identifier.includes('@');
    
    // If it's a phone number, create a temporary email
    const email = isEmail ? identifier : `user${identifier.replace('+', '')}@orcal.app`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: isEmail ? phone : identifier,
          email: isEmail ? identifier : email
        }
      }
    });

    if (data.user && !error) {
      try {
        await this.createProfile(data.user.id, name, isEmail ? identifier : email, isEmail ? phone : identifier);
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { data, error };
  }

  async signIn(identifier: string, password: string, type: 'email' | 'phone' = 'email') {
    let email = identifier;
    
    // If it's a phone number, convert to the temporary email format
    if (type === 'phone') {
      email = `user${identifier.replace('+', '')}@orcal.app`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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
  async createProfile(userId: string, name: string, email: string, phone: string, role: 'client' | 'admin' = 'client') {
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

  // Design Orders
  async createOrder(orderData: {
    client_id: string;
    client_name: string;
    client_phone: string;
    design_type: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    total_price?: number;
  }) {
    const { data, error } = await supabase
      .from('design_orders')
      .insert(orderData)
      .select()
      .single();

    return { data: data as DesignOrder, error };
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
    return data.map(order => ({
      ...order,
      status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
      priority: order.priority as 'low' | 'medium' | 'high'
    })) as DesignOrder[];
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
    return data.map(order => ({
      ...order,
      status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
      priority: order.priority as 'low' | 'medium' | 'high'
    })) as DesignOrder[];
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'in-progress' | 'completed' | 'delivered') {
    const { data, error } = await supabase
      .from('design_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    return { data: data as DesignOrder, error };
  }

  async updateOrder(orderId: string, updates: Partial<DesignOrder>) {
    const { data, error } = await supabase
      .from('design_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    return { data: data as DesignOrder, error };
  }

  async deleteOrder(orderId: string) {
    const { error } = await supabase
      .from('design_orders')
      .delete()
      .eq('id', orderId);

    return { error };
  }

  // File Management
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
    return data.map(file => ({
      ...file,
      file_type: file.file_type as 'image' | 'document' | 'design'
    })) as OrderFile[];
  }

  async uploadOrderFile(fileData: {
    order_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
    uploaded_by: string;
  }) {
    const { data, error } = await supabase
      .from('order_files')
      .insert(fileData)
      .select()
      .single();

    return { data: data as OrderFile, error };
  }

  async deleteOrderFile(fileId: string) {
    const { error } = await supabase
      .from('order_files')
      .delete()
      .eq('id', fileId);

    return { error };
  }

  // Chat Management
  async createChatRoom(orderId: string, clientId: string, adminId?: string) {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        order_id: orderId,
        client_id: clientId,
        admin_id: adminId
      })
      .select()
      .single();

    return { data: data as ChatRoom, error };
  }

  async getChatRoom(orderId: string): Promise<ChatRoom | null> {
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

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    return data.map(message => ({
      ...message,
      sender_role: message.sender_role as 'client' | 'admin' | 'system',
      message_type: message.message_type as 'text' | 'file' | 'system'
    })) as ChatMessage[];
  }

  async sendMessage(messageData: {
    room_id: string;
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'system';
    content: string;
    message_type?: 'text' | 'file' | 'system';
  }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...messageData,
        message_type: messageData.message_type || 'text'
      })
      .select()
      .single();

    return { data: data as ChatMessage, error };
  }

  async markMessagesAsRead(roomId: string, userId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_id', userId);

    return { error };
  }

  // Message Files
  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    const { data, error } = await supabase
      .from('message_files')
      .select('*')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching message files:', error);
      return [];
    }
    return data.map(file => ({
      ...file,
      file_type: file.file_type as 'image' | 'document' | 'design'
    })) as MessageFile[];
  }

  async uploadMessageFile(fileData: {
    message_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
  }) {
    const { data, error } = await supabase
      .from('message_files')
      .insert(fileData)
      .select()
      .single();

    return { data: data as MessageFile, error };
  }
}

export const supabaseService = new SupabaseService();

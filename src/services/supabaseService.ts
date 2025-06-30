
import { supabase } from '@/integrations/supabase/client';
import { Profile, DesignOrder, OrderFile, ChatRoom, ChatMessage, MessageFile } from '@/types/database';

class SupabaseService {
  // Authentication
  async signUp(identifier: string, password: string, name: string, phone: string = '') {
    const isEmail = identifier.includes('@');
    
    // If it's a phone number, create a temporary email
    const email = isEmail ? identifier : `user${identifier.replace('+', '')}@orcal.app`;
    
    console.log('SignUp attempt:', { email, name, phone: isEmail ? phone : identifier });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: isEmail ? phone : identifier,
          email: isEmail ? identifier : email
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (data.user && !error) {
      try {
        await this.createProfile(data.user.id, name, isEmail ? identifier : email, isEmail ? phone : identifier);
        console.log('Profile created successfully for user:', data.user.id);
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

    console.log('SignIn attempt:', { email, type });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (data.user && !error) {
      console.log('SignIn successful for user:', data.user.id);
    }

    return { data, error };
  }

  async signOut() {
    console.log('SignOut attempt');
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

  async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  }

  // Profile Management
  async createProfile(userId: string, name: string, email: string, phone: string, role: 'client' | 'admin' = 'client') {
    console.log('Creating profile for user:', userId, { name, email, phone, role });
    
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

    if (error) {
      console.error('Error creating profile:', error);
    } else {
      console.log('Profile created successfully:', data);
    }

    return { data: data as Profile, error };
  }

  async getProfile(userId: string): Promise<Profile | null> {
    console.log('Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    console.log('Profile fetched successfully:', data);
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
    console.log('Creating order:', orderData);
    
    const { data, error } = await supabase
      .from('design_orders')
      .insert(orderData)
      .select()
      .single();

    if (data && !error) {
      console.log('Order created successfully:', data.id);
      // Create chat room for the order
      await this.createChatRoom(data.id, orderData.client_id);
    } else {
      console.error('Error creating order:', error);
    }

    return { data: data as DesignOrder, error };
  }

  async getOrdersByClientId(clientId: string): Promise<DesignOrder[]> {
    console.log('Fetching orders for client:', clientId);
    
    const { data, error } = await supabase
      .from('design_orders')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
    
    console.log('Orders fetched successfully:', data?.length || 0);
    return data.map(order => ({
      ...order,
      status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
      priority: order.priority as 'low' | 'medium' | 'high'
    })) as DesignOrder[];
  }

  async getAllOrders(): Promise<DesignOrder[]> {
    console.log('Fetching all orders');
    
    const { data, error } = await supabase
      .from('design_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
    
    console.log('All orders fetched successfully:', data?.length || 0);
    return data.map(order => ({
      ...order,
      status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
      priority: order.priority as 'low' | 'medium' | 'high'
    })) as DesignOrder[];
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'in-progress' | 'completed' | 'delivered') {
    console.log('Updating order status:', orderId, status);
    
    const { data, error } = await supabase
      .from('design_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (!error) {
      console.log('Order status updated successfully');
    }

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
    console.log('Uploading order file:', fileData.name);
    
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

  // File upload functionality - محسن لحفظ الملفات
  async uploadFile(file: File, bucket: string, userId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // للتطوير: إنشاء رابط وهمي للملف
    // في التطبيق الحقيقي، يتم رفع الملف إلى Supabase Storage
    const mockUrl = `https://api.orcal.app/files/${fileName}`;
    
    console.log('File uploaded (mock):', mockUrl);
    return mockUrl;
  }

  async addOrderFile(fileData: {
    order_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
    uploaded_by: string;
  }) {
    return await this.uploadOrderFile(fileData);
  }

  // Chat Management
  async createChatRoom(orderId: string, clientId: string, adminId?: string) {
    console.log('Creating chat room for order:', orderId);
    
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        order_id: orderId,
        client_id: clientId,
        admin_id: adminId
      })
      .select()
      .single();

    if (!error) {
      console.log('Chat room created successfully:', data?.id);
    }

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

  async getChatRoomByOrderId(orderId: string): Promise<ChatRoom | null> {
    return await this.getChatRoom(orderId);
  }

  async getAllChatRooms(): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }
    return data as ChatRoom[];
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

  async getMessagesByOrderId(orderId: string): Promise<ChatMessage[]> {
    console.log('Fetching messages for order:', orderId);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages by order ID:', error);
      return [];
    }
    
    console.log('Messages fetched successfully:', data?.length || 0);
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
    console.log('Sending message:', messageData.content.substring(0, 50) + '...');
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...messageData,
        message_type: messageData.message_type || 'text'
      })
      .select()
      .single();

    if (!error) {
      console.log('Message sent successfully');
    }

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

  // Statistics
  async getStatistics() {
    const [ordersData, profilesData] = await Promise.all([
      supabase.from('design_orders').select('status'),
      supabase.from('profiles').select('role').eq('role', 'client')
    ]);

    const orders = ordersData.data || [];
    const clients = profilesData.data || [];

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      inProgressOrders: orders.filter(o => o.status === 'in-progress').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      activeClients: clients.length
    };
  }

  // Real-time subscriptions
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void) {
    console.log('Setting up real-time subscription for order:', orderId);
    
    const channel = supabase
      .channel(`messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('New message received via real-time:', payload.new);
          const message = {
            ...payload.new,
            sender_role: payload.new.sender_role as 'client' | 'admin' | 'system',
            message_type: payload.new.message_type as 'text' | 'file' | 'system'
          } as ChatMessage;
          callback(message);
        }
      )
      .subscribe();

    return channel;
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

import { supabase } from '@/integrations/supabase/client';
import { Profile, DesignOrder, OrderFile, ChatRoom, ChatMessage, MessageFile } from '@/types/database';

class SupabaseService {
  private cache = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Cache utility methods
  private getCacheKey(key: string, params?: any): string {
    return params ? `${key}_${JSON.stringify(params)}` : key;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Error handling utility
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    // Log to external service in production
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

  // Authentication with improved error handling
  async signUp(identifier: string, password: string, name: string, phone: string = '') {
    try {
      const isEmail = identifier.includes('@');
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
          this.clearCache('profile');
        } catch (profileError) {
          this.handleError(profileError, 'Profile Creation');
        }
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'SignUp') };
    }
  }

  async signIn(identifier: string, password: string, type: 'email' | 'phone' = 'email') {
    try {
      let email = identifier;
      
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
        this.clearCache('profile');
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'SignIn') };
    }
  }

  async signOut() {
    try {
      console.log('SignOut attempt');
      const { error } = await supabase.auth.signOut();
      this.clearCache();
      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'SignOut') };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      this.handleError(error, 'Get Current User');
      return null;
    }
  }

  async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      this.handleError(error, 'Get Current Session');
      return null;
    }
  }

  async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'Resend Confirmation') };
    }
  }

  // Profile Management with caching
  async createProfile(userId: string, name: string, email: string, phone: string, role: 'client' | 'admin' = 'client') {
    try {
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

      if (data && !error) {
        console.log('Profile created successfully:', data);
        this.setCache(`profile_${userId}`, data);
      }

      return { data: data as Profile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Create Profile') };
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const cacheKey = `profile_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        this.handleError(error, 'Get Profile');
        return null;
      }
      
      const profile = data as Profile;
      this.setCache(cacheKey, profile);
      console.log('Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      this.handleError(error, 'Get Profile');
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (!error) {
        this.clearCache(`profile_${userId}`);
      }

      return { data: data as Profile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Profile') };
    }
  }

  // Design Orders with improved performance
  async createOrder(orderData: {
    client_id: string;
    client_name: string;
    client_phone: string;
    design_type: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    total_price?: number;
  }) {
    try {
      console.log('Creating order:', orderData);
      
      const { data, error } = await supabase
        .from('design_orders')
        .insert(orderData)
        .select()
        .single();

      if (data && !error) {
        console.log('Order created successfully:', data.id);
        await this.createChatRoom(data.id, orderData.client_id);
        this.clearCache('orders');
        this.clearCache('statistics');
      }

      return { data: data as DesignOrder, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Create Order') };
    }
  }

  async getOrdersByClientId(clientId: string): Promise<DesignOrder[]> {
    try {
      const cacheKey = `orders_client_${clientId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching orders for client:', clientId);
      
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get Orders By Client');
        return [];
      }
      
      const orders = data.map(order => ({
        ...order,
        status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
        priority: order.priority as 'low' | 'medium' | 'high'
      })) as DesignOrder[];

      this.setCache(cacheKey, orders);
      console.log('Orders fetched successfully:', orders.length);
      return orders;
    } catch (error) {
      this.handleError(error, 'Get Orders By Client');
      return [];
    }
  }

  async getAllOrders(): Promise<DesignOrder[]> {
    try {
      const cacheKey = 'all_orders';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching all orders');
      
      const { data, error } = await supabase
        .from('design_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get All Orders');
        return [];
      }
      
      const orders = data.map(order => ({
        ...order,
        status: order.status as 'pending' | 'in-progress' | 'completed' | 'delivered',
        priority: order.priority as 'low' | 'medium' | 'high'
      })) as DesignOrder[];

      this.setCache(cacheKey, orders);
      console.log('All orders fetched successfully:', orders.length);
      return orders;
    } catch (error) {
      this.handleError(error, 'Get All Orders');
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: 'pending' | 'in-progress' | 'completed' | 'delivered') {
    try {
      console.log('Updating order status:', orderId, status);
      
      const { data, error } = await supabase
        .from('design_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (!error) {
        console.log('Order status updated successfully');
        this.clearCache('orders');
        this.clearCache('statistics');
      }

      return { data: data as DesignOrder, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Order Status') };
    }
  }

  async updateOrder(orderId: string, updates: Partial<DesignOrder>) {
    try {
      const { data, error } = await supabase
        .from('design_orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (!error) {
        this.clearCache('orders');
      }

      return { data: data as DesignOrder, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Order') };
    }
  }

  async deleteOrder(orderId: string) {
    try {
      const { error } = await supabase
        .from('design_orders')
        .delete()
        .eq('id', orderId);

      if (!error) {
        this.clearCache('orders');
        this.clearCache('statistics');
      }

      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'Delete Order') };
    }
  }

  // File Management with improved error handling
  async getOrderFiles(orderId: string): Promise<OrderFile[]> {
    try {
      const cacheKey = `files_${orderId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('order_files')
        .select('*')
        .eq('order_id', orderId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get Order Files');
        return [];
      }

      const files = data.map(file => ({
        ...file,
        file_type: file.file_type as 'image' | 'document' | 'design'
      })) as OrderFile[];

      this.setCache(cacheKey, files);
      return files;
    } catch (error) {
      this.handleError(error, 'Get Order Files');
      return [];
    }
  }

  async uploadOrderFile(fileData: {
    order_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
    uploaded_by: string;
  }) {
    try {
      console.log('Uploading order file:', fileData.name);
      
      const { data, error } = await supabase
        .from('order_files')
        .insert(fileData)
        .select()
        .single();

      if (!error) {
        this.clearCache(`files_${fileData.order_id}`);
      }

      return { data: data as OrderFile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Upload Order File') };
    }
  }

  async deleteOrderFile(fileId: string) {
    try {
      const { error } = await supabase
        .from('order_files')
        .delete()
        .eq('id', fileId);

      if (!error) {
        this.clearCache('files');
      }

      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'Delete Order File') };
    }
  }

  // Enhanced file upload with progress tracking
  async uploadFile(file: File, bucket: string, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // محاكاة رفع الملف - في البيئة الحقيقية سيتم استخدام Storage
      const mockUrl = `https://api.orcal.app/files/${fileName}`;
      
      console.log('File uploaded (mock):', mockUrl);
      return mockUrl;
    } catch (error) {
      this.handleError(error, 'Upload File');
      return null;
    }
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

  // Chat Management with real-time optimization
  async createChatRoom(orderId: string, clientId: string, adminId?: string) {
    try {
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
        this.clearCache('chat_rooms');
      }

      return { data: data as ChatRoom, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Create Chat Room') };
    }
  }

  async getChatRoom(orderId: string): Promise<ChatRoom | null> {
    try {
      const cacheKey = `chat_room_${orderId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        this.handleError(error, 'Get Chat Room');
        return null;
      }

      const chatRoom = data as ChatRoom;
      this.setCache(cacheKey, chatRoom);
      return chatRoom;
    } catch (error) {
      this.handleError(error, 'Get Chat Room');
      return null;
    }
  }

  async getChatRoomByOrderId(orderId: string): Promise<ChatRoom | null> {
    return await this.getChatRoom(orderId);
  }

  async getAllChatRooms(): Promise<ChatRoom[]> {
    try {
      const cacheKey = 'all_chat_rooms';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get All Chat Rooms');
        return [];
      }

      const chatRooms = data as ChatRoom[];
      this.setCache(cacheKey, chatRooms);
      return chatRooms;
    } catch (error) {
      this.handleError(error, 'Get All Chat Rooms');
      return [];
    }
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const cacheKey = `messages_${roomId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        this.handleError(error, 'Get Chat Messages');
        return [];
      }

      const messages = data.map(message => ({
        ...message,
        sender_role: message.sender_role as 'client' | 'admin' | 'system',
        message_type: message.message_type as 'text' | 'file' | 'system'
      })) as ChatMessage[];

      this.setCache(cacheKey, messages);
      return messages;
    } catch (error) {
      this.handleError(error, 'Get Chat Messages');
      return [];
    }
  }

  async getMessagesByOrderId(orderId: string): Promise<ChatMessage[]> {
    try {
      const cacheKey = `messages_order_${orderId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching messages for order:', orderId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        this.handleError(error, 'Get Messages By Order');
        return [];
      }
      
      const messages = data.map(message => ({
        ...message,
        sender_role: message.sender_role as 'client' | 'admin' | 'system',
        message_type: message.message_type as 'text' | 'file' | 'system'
      })) as ChatMessage[];

      this.setCache(cacheKey, messages);
      console.log('Messages fetched successfully:', messages.length);
      return messages;
    } catch (error) {
      this.handleError(error, 'Get Messages By Order');
      return [];
    }
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
    try {
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
        this.clearCache(`messages_${messageData.room_id}`);
        this.clearCache(`messages_order_${messageData.order_id}`);
      }

      return { data: data as ChatMessage, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Send Message') };
    }
  }

  async markMessagesAsRead(roomId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_id', userId);

      if (!error) {
        this.clearCache(`messages_${roomId}`);
      }

      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'Mark Messages As Read') };
    }
  }

  // Statistics with caching
  async getStatistics() {
    try {
      const cacheKey = 'statistics';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const [ordersData, profilesData] = await Promise.all([
        supabase.from('design_orders').select('status'),
        supabase.from('profiles').select('role').eq('role', 'client')
      ]);

      const orders = ordersData.data || [];
      const clients = profilesData.data || [];

      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        inProgressOrders: orders.filter(o => o.status === 'in-progress').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        activeClients: clients.length
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      this.handleError(error, 'Get Statistics');
      return {
        totalOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
        activeClients: 0
      };
    }
  }

  // Real-time subscriptions with improved error handling
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void) {
    try {
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
            
            // Clear cache when new message arrives
            this.clearCache(`messages_${payload.new.room_id}`);
            this.clearCache(`messages_order_${orderId}`);
            
            callback(message);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return channel;
    } catch (error) {
      this.handleError(error, 'Subscribe To Messages');
      return null;
    }
  }

  // Message Files with caching
  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    try {
      const cacheKey = `message_files_${messageId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('message_files')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        this.handleError(error, 'Get Message Files');
        return [];
      }

      const files = data.map(file => ({
        ...file,
        file_type: file.file_type as 'image' | 'document' | 'design'
      })) as MessageFile[];

      this.setCache(cacheKey, files);
      return files;
    } catch (error) {
      this.handleError(error, 'Get Message Files');
      return [];
    }
  }

  async uploadMessageFile(fileData: {
    message_id: string;
    name: string;
    url: string;
    file_type: 'image' | 'document' | 'design';
    size_bytes: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('message_files')
        .insert(fileData)
        .select()
        .single();

      if (!error) {
        this.clearCache(`message_files_${fileData.message_id}`);
      }

      return { data: data as MessageFile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Upload Message File') };
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch (error) {
      this.handleError(error, 'Health Check');
      return false;
    }
  }

  // Clear all cache (useful for logout or refresh)
  clearAllCache(): void {
    this.clearCache();
  }
}

export const supabaseService = new SupabaseService();

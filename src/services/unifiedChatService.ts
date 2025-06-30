import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, ChatMessage, DesignOrder, OrderFile, MessageFile } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

export class UnifiedChatService {
  private static instance: UnifiedChatService;
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  static getInstance(): UnifiedChatService {
    if (!UnifiedChatService.instance) {
      UnifiedChatService.instance = new UnifiedChatService();
    }
    return UnifiedChatService.instance;
  }

  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    return error;
  }

  // إنشاء أو جلب غرفة الدردشة مع دعم المصممين
  async getOrCreateChatRoom(orderId: string, userId: string, userRole: string = 'client'): Promise<ChatRoom | null> {
    try {
      console.log('Getting/Creating chat room for order:', orderId, 'User:', userId, 'Role:', userRole);
      
      // محاولة جلب الغرفة الموجودة أولاً
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (existingRoom && !fetchError) {
        console.log('Found existing chat room:', existingRoom.id);
        return existingRoom as ChatRoom;
      }

      // إنشاء غرفة جديدة
      const roomData: any = {
        order_id: orderId,
        unread_count: 0,
        is_active: true
      };

      // تحديد العميل والإدمن/المصمم بناءً على الدور
      if (userRole === 'client') {
        roomData.client_id = userId;
        roomData.admin_id = null;
      } else {
        // للمصمم أو الإدمن
        roomData.admin_id = userId;
        // نحتاج لجلب معرف العميل من الطلب
        const { data: orderData } = await supabase
          .from('design_orders')
          .select('client_id')
          .eq('id', orderId)
          .single();
        
        if (orderData) {
          roomData.client_id = orderData.client_id;
        }
      }

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert(roomData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating chat room:', createError);
        return null;
      }

      console.log('Created new chat room:', newRoom?.id);
      return newRoom as ChatRoom;
    } catch (error) {
      this.handleError(error, 'Get/Create Chat Room');
      return null;
    }
  }

  // جلب جميع الرسائل لطلب معين
  async getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      console.log('Fetching messages for order:', orderId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      const messages = data.map(message => ({
        ...message,
        sender_role: message.sender_role as 'client' | 'admin' | 'designer' | 'system',
        message_type: message.message_type as 'text' | 'file' | 'system'
      })) as ChatMessage[];

      console.log('Messages fetched successfully:', messages.length);
      return messages;
    } catch (error) {
      this.handleError(error, 'Get Messages');
      return [];
    }
  }

  // إرسال رسالة مع دعم كامل للمصممين
  async sendMessage(messageData: {
    order_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'client' | 'admin' | 'designer' | 'system';
    content: string;
    message_type?: 'text' | 'file' | 'system';
    files?: OrderFile[];
  }): Promise<{ success: boolean; message?: ChatMessage; error?: any }> {
    try {
      console.log('Sending message:', {
        content: messageData.content.substring(0, 50) + '...',
        sender_role: messageData.sender_role,
        sender_name: messageData.sender_name,
        sender_id: messageData.sender_id
      });
      
      // التأكد من وجود غرفة الدردشة
      const room = await this.getOrCreateChatRoom(
        messageData.order_id, 
        messageData.sender_id, 
        messageData.sender_role
      );
      
      if (!room) {
        throw new Error('Failed to get or create chat room');
      }

      console.log('Using chat room:', room.id);

      // إرسال الرسالة مباشرة
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          order_id: messageData.order_id,
          sender_id: messageData.sender_id,
          sender_name: messageData.sender_name,
          sender_role: messageData.sender_role,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error };
      }

      console.log('Message sent successfully:', data.id);

      // رفع الملفات إذا كانت موجودة
      if (messageData.files && messageData.files.length > 0) {
        for (const file of messageData.files) {
          await this.attachFileToMessage(data.id, file);
        }
      }

      // تحديث غرفة الدردشة
      await supabase
        .from('chat_rooms')
        .update({
          updated_at: new Date().toISOString(),
          unread_count: room.unread_count + 1
        })
        .eq('id', room.id);

      console.log('Message sent successfully with enhanced sync');
      return { success: true, message: data as ChatMessage };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return { success: false, error: this.handleError(error, 'Send Message') };
    }
  }

  async attachFileToMessage(messageId: string, file: OrderFile): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('message_files')
        .insert({
          message_id: messageId,
          name: file.name,
          url: file.url,
          file_type: file.file_type,
          size_bytes: file.size_bytes
        });

      if (error) {
        console.error('Error attaching file:', error);
        return false;
      }

      return true;
    } catch (error) {
      this.handleError(error, 'Attach File to Message');
      return false;
    }
  }

  // رفع ملف جديد
  async uploadFile(file: File, orderId: string, uploaderId: string): Promise<OrderFile | null> {
    try {
      console.log('Uploading file:', file.name);
      
      // محاكاة رفع الملف
      const fileUrl = `https://api.orcal.app/files/${uploaderId}/${Date.now()}_${file.name}`;
      
      const fileData: OrderFile = {
        id: `file-${Date.now()}`,
        order_id: orderId,
        name: file.name,
        url: fileUrl,
        file_type: this.getFileType(file.name),
        size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: uploaderId
      };

      const { data, error } = await supabase
        .from('order_files')
        .insert(fileData)
        .select()
        .single();

      if (error) {
        console.error('Error saving file info:', error);
        return null;
      }

      console.log('File uploaded successfully:', fileUrl);
      return data as OrderFile;
    } catch (error) {
      this.handleError(error, 'Upload File');
      return null;
    }
  }

  private getFileType(fileName: string): 'image' | 'document' | 'design' {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'document';
    }
    return 'design';
  }

  // الاشتراك في الرسائل الجديدة
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void): (() => void) | null {
    try {
      console.log('Setting up real-time subscription for order:', orderId);
      
      const channelName = `messages-${orderId}`;
      
      // إغلاق القناة الموجودة إن وجدت
      if (this.activeChannels.has(channelName)) {
        this.activeChannels.get(channelName)?.unsubscribe();
        this.activeChannels.delete(channelName);
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `order_id=eq.${orderId}`
          },
          (payload) => {
            console.log('Real-time message received:', payload.new);
            
            if (!payload.new || typeof payload.new !== 'object') {
              console.warn('Invalid message payload received:', payload);
              return;
            }

            const messageData = payload.new as any;
            
            const message = {
              ...messageData,
              sender_role: (messageData.sender_role || 'client') as 'client' | 'admin' | 'designer' | 'system',
              message_type: (messageData.message_type || 'text') as 'text' | 'file' | 'system'
            } as ChatMessage;
            
            callback(message);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Real-time connection established for order:', orderId);
          }
        });

      this.activeChannels.set(channelName, channel);

      return () => {
        console.log('Unsubscribing from real-time messages for order:', orderId);
        channel.unsubscribe();
        this.activeChannels.delete(channelName);
      };
    } catch (error) {
      this.handleError(error, 'Subscribe To Messages');
      return null;
    }
  }

  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .neq('sender_id', userId);

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      const { error: roomError } = await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('order_id', orderId);

      if (roomError) {
        console.error('Error updating room unread count:', roomError);
      }

      return true;
    } catch (error) {
      this.handleError(error, 'Mark Messages As Read');
      return false;
    }
  }

  async getMessageFiles(messageId: string): Promise<MessageFile[]> {
    try {
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
    } catch (error) {
      this.handleError(error, 'Get Message Files');
      return [];
    }
  }

  cleanup() {
    console.log('Cleaning up all real-time subscriptions...');
    this.activeChannels.forEach((channel, name) => {
      console.log('Unsubscribing from channel:', name);
      channel.unsubscribe();
    });
    this.activeChannels.clear();
    console.log('All subscriptions cleaned up successfully');
  }
}

export const unifiedChatService = UnifiedChatService.getInstance();

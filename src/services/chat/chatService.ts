
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, ChatMessage } from '@/types/database';
import { CacheService } from '../cache/cacheService';

export class ChatService extends CacheService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

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
        sender_role: message.sender_role as 'client' | 'admin' | 'designer' | 'system',
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
        sender_role: message.sender_role as 'client' | 'admin' | 'designer' | 'system',
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
    sender_role: 'client' | 'admin' | 'designer' | 'system';
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
              sender_role: payload.new.sender_role as 'client' | 'admin' | 'designer' | 'system',
              message_type: payload.new.message_type as 'text' | 'file' | 'system'
            } as ChatMessage;
            
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
}

export const chatService = new ChatService();

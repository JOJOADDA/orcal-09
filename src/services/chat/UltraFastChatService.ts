import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatRoom, Profile, DesignOrder } from '@/types/database';
import { performanceService } from '@/services/performanceService';

interface SendMessageParams {
  order_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'client' | 'admin' | 'designer' | 'system';
  content: string;
  message_type?: 'text' | 'file' | 'system';
}

interface MessageResult {
  success: boolean;
  message?: ChatMessage;
  error?: { message: string; details?: any };
}

class UltraFastChatService {
  private static instance: UltraFastChatService;
  private messageCache = new Map<string, ChatMessage[]>();
  private roomCache = new Map<string, ChatRoom>();
  private subscriptions = new Map<string, () => void>();

  static getInstance(): UltraFastChatService {
    if (!UltraFastChatService.instance) {
      UltraFastChatService.instance = new UltraFastChatService();
    }
    return UltraFastChatService.instance;
  }

  // إرسال رسالة محسن للغاية
  async sendMessage(params: SendMessageParams): Promise<MessageResult> {
    return performanceService.measureOperation('sendMessage', async () => {
      try {
        console.log('🚀 Ultra Fast Chat - Sending message:', {
          sender: params.sender_name,
          role: params.sender_role,
          order: params.order_id,
          length: params.content.length
        });

        // التحقق الأساسي السريع
        if (!params.content?.trim()) {
          return { success: false, error: { message: 'محتوى الرسالة فارغ' } };
        }

        // الحصول على الغرفة بكفاءة عالية
        const room = await this.getOrCreateChatRoomFast(params.order_id, params.sender_id, params.sender_role);
        if (!room) {
          return { success: false, error: { message: 'فشل في الوصول لغرفة الدردشة' } };
        }

        // إرسال الرسالة مباشرة
        const { data: message, error } = await supabase
          .from('chat_messages')
          .insert({
            room_id: room.id,
            order_id: params.order_id,
            sender_id: params.sender_id,
            sender_name: params.sender_name,
            sender_role: params.sender_role,
            content: params.content.trim(),
            message_type: params.message_type || 'text',
            is_read: false
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Database error:', error);
          
          // رسائل خطأ مفهومة
          let errorMessage = 'فشل في إرسال الرسالة';
          if (error.code === '42501') {
            errorMessage = 'ليس لديك صلاحية لإرسال رسائل في هذا الطلب. تأكد من تسجيل الدخول كمصمم.';
          } else if (error.code === '23503') {
            errorMessage = 'خطأ في ربط البيانات. يرجى إعادة المحاولة.';
          }

          return { success: false, error: { message: errorMessage, details: error } };
        }

        const chatMessage = message as ChatMessage;
        
        // تحديث الكاش المحلي فوراً
        this.updateMessageCache(params.order_id, chatMessage);
        
        console.log('✅ Message sent successfully with ID:', chatMessage.id);
        return { success: true, message: chatMessage };

      } catch (error) {
        console.error('💥 Unexpected error:', error);
        return { 
          success: false, 
          error: { 
            message: 'خطأ غير متوقع. يرجى إعادة المحاولة أو إعادة تحميل الصفحة.',
            details: error
          } 
        };
      }
    });
  }

  // جلب الرسائل محسن
  async getMessages(orderId: string): Promise<ChatMessage[]> {
    return performanceService.measureOperation('getMessages', async () => {
      try {
        // التحقق من الكاش أولاً
        const cached = this.messageCache.get(orderId);
        if (cached) {
          console.log('📦 Retrieved messages from cache:', cached.length);
          return cached;
        }

        console.log('🔄 Loading messages from database for order:', orderId);
        
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ Error fetching messages:', error);
          return [];
        }

        const messages = (data || []) as ChatMessage[];
        
        // حفظ في الكاش
        this.messageCache.set(orderId, messages);
        
        console.log('✅ Messages loaded:', messages.length);
        return messages;

      } catch (error) {
        console.error('💥 Error in getMessages:', error);
        return [];
      }
    });
  }

  // إنشاء أو الحصول على غرفة دردشة سريع
  private async getOrCreateChatRoomFast(orderId: string, userId: string, userRole: string): Promise<ChatRoom | null> {
    try {
      // التحقق من الكاش
      const cached = this.roomCache.get(orderId);
      if (cached) {
        // تحديث admin_id للمصممين إذا لزم الأمر
        if (userRole === 'designer' && cached.admin_id !== userId) {
          await this.updateRoomAdmin(cached.id, userId);
          cached.admin_id = userId;
          this.roomCache.set(orderId, cached);
        }
        return cached;
      }

      // البحث عن غرفة موجودة
      const { data: room, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching chat room:', error);
        return null;
      }

      if (room) {
        // تحديث admin_id للمصممين
        if (userRole === 'designer' && room.admin_id !== userId) {
          await this.updateRoomAdmin(room.id, userId);
          room.admin_id = userId;
        }
        
        this.roomCache.set(orderId, room as ChatRoom);
        return room as ChatRoom;
      }

      // إنشاء غرفة جديدة
      const { data: order } = await supabase
        .from('design_orders')
        .select('client_id')
        .eq('id', orderId)
        .single();

      if (!order) {
        console.error('❌ Order not found:', orderId);
        return null;
      }

      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          order_id: orderId,
          client_id: order.client_id,
          admin_id: userRole === 'designer' ? userId : null,
          unread_count: 0,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create chat room:', createError);
        return null;
      }

      const chatRoom = newRoom as ChatRoom;
      this.roomCache.set(orderId, chatRoom);
      
      console.log('✅ Created new chat room:', chatRoom.id);
      return chatRoom;

    } catch (error) {
      console.error('💥 Error in getOrCreateChatRoomFast:', error);
      return null;
    }
  }

  // تحديث admin_id للغرفة
  private async updateRoomAdmin(roomId: string, adminId: string): Promise<void> {
    try {
      await supabase
        .from('chat_rooms')
        .update({ admin_id: adminId })
        .eq('id', roomId);
    } catch (error) {
      console.warn('⚠️ Failed to update room admin:', error);
    }
  }

  // تحديث كاش الرسائل
  private updateMessageCache(orderId: string, newMessage: ChatMessage): void {
    const existing = this.messageCache.get(orderId) || [];
    const updated = [...existing, newMessage];
    this.messageCache.set(orderId, updated);
  }

  // الاشتراك في الرسائل الفورية محسن
  subscribeToMessages(orderId: string, callback: (message: ChatMessage) => void): (() => void) | null {
    try {
      // إلغاء الاشتراك السابق إن وجد
      const existingUnsubscribe = this.subscriptions.get(orderId);
      if (existingUnsubscribe) {
        existingUnsubscribe();
      }

      console.log('🔔 Subscribing to real-time messages for order:', orderId);

      const channel = supabase
        .channel(`messages_${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `order_id=eq.${orderId}`
          },
          (payload) => {
            console.log('📨 New real-time message:', payload.new);
            const newMessage = payload.new as ChatMessage;
            
            // تحديث الكاش
            this.updateMessageCache(orderId, newMessage);
            
            // استدعاء callback
            callback(newMessage);
          }
        )
        .subscribe();

      const unsubscribe = () => {
        console.log('📴 Unsubscribing from messages for order:', orderId);
        supabase.removeChannel(channel);
        this.subscriptions.delete(orderId);
      };

      this.subscriptions.set(orderId, unsubscribe);
      return unsubscribe;

    } catch (error) {
      console.error('💥 Error subscribing to messages:', error);
      return null;
    }
  }

  // تحديد الرسائل كمقروءة
  async markMessagesAsRead(orderId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .neq('sender_id', userId);

      if (error) {
        console.error('❌ Error marking messages as read:', error);
        return false;
      }

      // تحديث عدد الرسائل غير المقروءة
      await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('order_id', orderId);

      return true;
    } catch (error) {
      console.error('💥 Error in markMessagesAsRead:', error);
      return false;
    }
  }

  // تنظيف الذاكرة
  cleanup(): void {
    // إلغاء جميع الاشتراكات
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();

    // تنظيف الكاش
    this.messageCache.clear();
    this.roomCache.clear();
    
    console.log('🧹 Ultra Fast Chat Service cleaned up');
  }

  // إحصائيات الأداء
  getPerformanceStats(): Record<string, any> {
    return {
      cachedMessages: this.messageCache.size,
      cachedRooms: this.roomCache.size,
      activeSubscriptions: this.subscriptions.size,
      performanceMetrics: performanceService.getPerformanceReport()
    };
  }
}

export const ultraFastChatService = UltraFastChatService.getInstance();
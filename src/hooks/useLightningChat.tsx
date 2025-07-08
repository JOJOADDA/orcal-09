import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, Profile, DesignOrder } from '@/types/database';
import { unifiedChatService } from '@/services/unifiedChatService';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { performanceService } from '@/services/performanceService';

interface LightningChatProps {
  user: Profile;
  order: DesignOrder;
}

export const useLightningChat = ({ user, order }: LightningChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string>('');
  const retryCountRef = useRef(0);
  const { toast } = useToast();
  const { showNotification } = useNotifications();

  // تحميل الرسائل محسن بالكاش
  const loadMessages = useCallback(async () => {
    return performanceService.measureOperation('loadMessages', async () => {
      setIsLoadingMessages(true);
      try {
        console.log('⚡ Lightning Chat - Loading messages for order:', order.id);
        const orderMessages = await unifiedChatService.getMessages(order.id);
        setMessages(orderMessages);
        await unifiedChatService.markMessagesAsRead(order.id, user.id);
        
        if (orderMessages.length > 0) {
          lastMessageIdRef.current = orderMessages[orderMessages.length - 1].id;
        }
        
        console.log('✅ Messages loaded successfully:', orderMessages.length);
        retryCountRef.current = 0; // إعادة تعيين عداد المحاولات
      } catch (error) {
        console.error('❌ Error loading messages:', error);
        
        // إعادة محاولة ذكية
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          console.log(`🔄 Retrying... attempt ${retryCountRef.current}`);
          setTimeout(loadMessages, 1000 * retryCountRef.current);
          return;
        }
        
        toast({
          title: "خطأ",
          description: "فشل في تحميل الرسائل. يرجى إعادة تحميل الصفحة.",
          variant: "destructive",
          duration: 5000
        });
      } finally {
        setIsLoadingMessages(false);
      }
    });
  }, [order.id, user.id, toast]);

  // إرسال رسالة محسن للغاية
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || isLoading) return false;

    return performanceService.measureOperation('sendMessage', async () => {
      setIsLoading(true);
      const messageContent = content.trim();
      
      try {
        console.log('⚡ Lightning Chat - Sending message:', {
          sender: user.name,
          role: user.role,
          length: messageContent.length
        });
        
        const result = await unifiedChatService.sendMessage({
          order_id: order.id,
          sender_id: user.id,
          sender_name: user.name,
          sender_role: user.role as 'client' | 'admin' | 'designer' | 'system',
          content: messageContent,
          message_type: 'text'
        });

        if (!result.success) {
          const errorMessage = result.error?.message || 'فشل في إرسال الرسالة';
          console.error('❌ Failed to send message:', result.error);
          
          toast({
            title: "خطأ في إرسال الرسالة",
            description: errorMessage,
            variant: "destructive",
            duration: 7000
          });
          return false;
        }

        console.log('✅ Message sent successfully');
        retryCountRef.current = 0; // إعادة تعيين عداد المحاولات
        return true;

      } catch (error) {
        console.error('💥 Unexpected error sending message:', error);
        toast({
          title: "خطأ غير متوقع",
          description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
          duration: 5000
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    });
  }, [order.id, user.id, user.name, user.role, isLoading, toast]);

  // تمرير محسن للأسفل
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end'
      });
    });
  }, []);

  // مراقبة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      console.log('🌐 Connection restored');
      // إعادة تحميل الرسائل عند استعادة الاتصال
      loadMessages();
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      console.log('📴 Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadMessages]);

  // اشتراك محسن للرسائل الفورية
  useEffect(() => {
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('📨 Lightning Chat - New message received:', newMessage.id);
      
      // تجنب الرسائل المكررة
      if (newMessage.id === lastMessageIdRef.current) {
        return;
      }
      
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        lastMessageIdRef.current = newMessage.id;
        return [...prev, newMessage];
      });
      
      // إشعارات محسنة للرسائل الجديدة
      if (newMessage.sender_id !== user.id) {
        showNotification(newMessage, () => {
          console.log('🔔 Opening chat from notification');
        }, order.id);
        
        toast({
          title: "رسالة جديدة ⚡",
          description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
          duration: 3000
        });
      }
      
      // التمرير للأسفل تلقائياً
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [order.id, user.id, loadMessages, showNotification, toast, scrollToBottom]);

  // التمرير التلقائي عند تغيير الرسائل
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // إحصائيات الأداء
  const getPerformanceStats = useCallback(() => {
    return {
      ...unifiedChatService.getPerformanceStats(),
      messagesCount: messages.length,
      isOnline: onlineStatus,
      retryCount: retryCountRef.current
    };
  }, [messages.length, onlineStatus]);

  return {
    messages,
    isLoading,
    isLoadingMessages,
    isTyping,
    onlineStatus,
    messagesEndRef,
    sendMessage,
    scrollToBottom,
    loadMessages,
    getPerformanceStats
  };
};
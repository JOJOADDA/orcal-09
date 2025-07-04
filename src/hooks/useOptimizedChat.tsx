import { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { ChatMessage, Profile, DesignOrder } from '@/types/database';
import { unifiedChatService } from '@/services/unifiedChatService';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/NotificationProvider';

interface OptimizedChatHookProps {
  user: Profile;
  order: DesignOrder;
}

export const useOptimizedChat = ({ user, order }: OptimizedChatHookProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const { toast } = useToast();
  const { showNotification } = useNotifications();

  // تحسين تحميل الرسائل مع useCallback
  const loadMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      console.log('Loading messages for order:', order.id, 'User:', user.id);
      const orderMessages = await unifiedChatService.getMessages(order.id);
      setMessages(orderMessages);
      await unifiedChatService.markMessagesAsRead(order.id, user.id);
      console.log('Messages loaded successfully:', orderMessages.length);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الرسائل",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [order.id, user.id, toast]);

  // تحسين إرسال الرسائل مع useCallback
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || isLoading) return false;

    setIsLoading(true);
    
    try {
      console.log('Sending message from:', user.name, 'Role:', user.role, 'Content:', content.substring(0, 50));
      
      const result = await unifiedChatService.sendMessage({
        order_id: order.id,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role as 'client' | 'admin' | 'designer' | 'system',
        content: content.trim(),
        message_type: 'text'
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'فشل في إرسال الرسالة');
      }

      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [order.id, user.id, user.name, user.role, isLoading, toast]);

  // اشتراك محسن للرسائل الفورية
  useEffect(() => {
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received in optimized chat:', newMessage);
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
      
      // إشعارات محسنة للرسائل الجديدة
      if (newMessage.sender_id !== user.id) {
        showNotification(newMessage, () => {
          console.log('Opening chat from notification');
        }, order.id);
        
        toast({
          title: "رسالة جديدة",
          description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}...`,
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [order.id, user.id, loadMessages, showNotification, toast]);

  return {
    messages,
    isLoading,
    isLoadingMessages,
    sendMessage,
    loadMessages
  };
};
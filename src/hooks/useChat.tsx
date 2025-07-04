
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Profile, DesignOrder } from '@/types/database';
import { unifiedChatService } from '@/services/unifiedChatService';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/NotificationProvider';

interface UseChatProps {
  user: Profile;
  order: DesignOrder;
}

export const useChat = ({ user, order }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { showNotification } = useNotifications();

  // Load messages
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
  }, [order.id, user.id]);

  // Send message
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
  }, [order.id, user.id, user.name, user.role, isLoading]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received in useChat:', newMessage);
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
      
      // Show WhatsApp-style notification if message is from other user
      if (newMessage.sender_id !== user.id) {
        showNotification(newMessage, () => {
          // يمكن إضافة منطق لفتح الدردشة هنا إذا لزم الأمر
          console.log('Opening chat from notification');
        }, order.id);
        
        // Keep toast as backup
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
  }, [order.id, user.id, loadMessages]);

  // Auto scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messages,
    isLoading,
    isLoadingMessages,
    isTyping,
    onlineStatus,
    messagesEndRef,
    sendMessage,
    scrollToBottom,
    loadMessages
  };
};

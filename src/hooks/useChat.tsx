
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Profile, DesignOrder } from '@/types/database';
import { realChatService } from '@/services/chat/realChatService';
import { useToast } from '@/hooks/use-toast';

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

  // Load messages
  const loadMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const orderMessages = await realChatService.getMessagesByOrderId(order.id);
      setMessages(orderMessages);
      await realChatService.markMessagesAsRead(order.id, user.id);
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
      const result = await realChatService.sendMessage({
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
    
    const unsubscribe = realChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received:', newMessage);
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
      
      // Show notification if message is from other user
      if (newMessage.sender_id !== user.id) {
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

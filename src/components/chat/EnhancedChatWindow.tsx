
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile, ChatMessage, DesignOrder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { unifiedChatService } from '@/services/unifiedChatService';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface EnhancedChatWindowProps {
  user: Profile;
  order: DesignOrder;
  onClose: () => void;
}

const EnhancedChatWindow = ({ user, order, onClose }: EnhancedChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== EnhancedChatWindow initialized ===');
    console.log('User:', user);
    console.log('User role:', user.role);
    console.log('Order:', order);
    
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received in EnhancedChatWindow:', newMessage);
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        console.log('Adding new message to chat');
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
      console.log('EnhancedChatWindow cleanup');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [order.id, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      console.log('=== Loading messages ===');
      console.log('Order ID:', order.id);
      console.log('User ID:', user.id);
      console.log('User Role:', user.role);
      
      const orderMessages = await unifiedChatService.getMessages(order.id);
      console.log('Messages loaded:', orderMessages.length);
      console.log('Sample messages:', orderMessages.slice(0, 3));
      
      setMessages(orderMessages);
      await unifiedChatService.markMessagesAsRead(order.id, user.id);
      console.log('Messages marked as read');
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
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) {
      toast({
        title: "تنبيه",
        description: "لا يمكن إرسال رسالة فارغة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('=== Sending message ===');
      console.log('Sender:', user.name, 'Role:', user.role, 'ID:', user.id);
      console.log('Content:', messageContent.substring(0, 50));
      console.log('Order ID:', order.id);
      
      const result = await unifiedChatService.sendMessage({
        order_id: order.id,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role as 'client' | 'admin' | 'designer' | 'system',
        content: messageContent,
        message_type: 'text'
      });

      if (!result.success) {
        console.error('Failed to send message:', result.error);
        throw new Error(result.error?.message || 'فشل في إرسال الرسالة');
      }
      
      console.log('Message sent successfully');
      
      // التمرير إلى الأسفل بعد إرسال الرسالة
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: (error as any)?.message || "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      throw error; // Re-throw to let ChatInput handle message restoration
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[85vh] bg-white shadow-2xl flex flex-col border-0 overflow-hidden">
        <ChatHeader 
          order={order}
          user={user}
          onlineStatus={onlineStatus}
          onClose={onClose}
        />
        
        <CardContent className="flex-1 flex flex-col p-0 bg-gray-50">
          <ChatMessages
            messages={messages}
            user={user}
            isLoadingMessages={isLoadingMessages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedChatWindow;

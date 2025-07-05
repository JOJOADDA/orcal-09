import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  X, ArrowLeft, Send, MessageSquare, Phone, Video, MoreVertical
} from 'lucide-react';
import { Profile, ChatMessage, DesignOrder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { unifiedChatService } from '@/services/unifiedChatService';
import { cn } from '@/lib/utils';

interface ImprovedChatWindowProps {
  user: Profile;
  order: DesignOrder;
  onClose: () => void;
}

const ImprovedChatWindow = ({ user, order, onClose }: ImprovedChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { showNotification } = useNotifications();

  // تحسين التمرير إلى الأسفل
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end'
      });
    }
  }, []);

  // تحميل الرسائل
  const loadMessages = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      console.log('Loading messages for order:', order.id);
      const orderMessages = await unifiedChatService.getMessages(order.id);
      setMessages(orderMessages);
      await unifiedChatService.markMessagesAsRead(order.id, user.id);
      
      // التمرير للأسفل بعد تحميل الرسائل
      setTimeout(scrollToBottom, 100);
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
  }, [order.id, user.id, toast, scrollToBottom]);

  // إرسال رسالة
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);
    
    try {
      console.log('Sending message:', messageContent);
      
      const result = await unifiedChatService.sendMessage({
        order_id: order.id,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role as 'client' | 'admin' | 'designer' | 'system',
        content: messageContent,
        message_type: 'text'
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'فشل في إرسال الرسالة');
      }
      
      // التمرير للأسفل بعد إرسال الرسالة
      setTimeout(scrollToBottom, 100);
      
      // إعادة التركيز على الحقل
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // استعادة الرسالة عند الخطأ
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [newMessage, isLoading, order.id, user.id, user.name, user.role, toast, scrollToBottom]);

  // الاشتراك في الرسائل الفورية
  useEffect(() => {
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received:', newMessage);
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        const updated = [...prev, newMessage];
        // التمرير للأسفل عند وصول رسالة جديدة
        setTimeout(scrollToBottom, 100);
        return updated;
      });
      
      // إشعار للرسائل من المستخدمين الآخرين
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
  }, [order.id, user.id, loadMessages, showNotification, toast, scrollToBottom]);

  // معلومات حالة الطلب
  const getStatusColor = (status: DesignOrder['status']) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'in-progress': 'bg-blue-500',
      'completed': 'bg-green-500',
      'delivered': 'bg-purple-500'
    };
    return colors[status];
  };

  const getStatusText = (status: DesignOrder['status']) => {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in-progress': 'جاري التنفيذ',
      'completed': 'مكتمل',
      'delivered': 'تم التسليم'
    };
    return statusMap[status];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[90vh] bg-white shadow-2xl flex flex-col border-0 overflow-hidden">
        {/* Header مع زر الرجوع */}
        <div className="flex flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            {/* زر الرجوع */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarFallback className="bg-white/10 text-white font-semibold">
                {order.client_name ? getInitials(order.client_name) : 'ع'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{order.design_type}</h3>
                <Badge 
                  className={cn(
                    "text-xs text-white border-white/20",
                    getStatusColor(order.status)
                  )}
                >
                  {getStatusText(order.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span>العميل: {order.client_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    onlineStatus ? "bg-green-400" : "bg-gray-400"
                  )} />
                  {onlineStatus ? "متصل" : "غير متصل"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <MoreVertical className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-red-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="flex-1 flex flex-col p-0 bg-gray-50">
          {/* منطقة الرسائل */}
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 p-4"
          >
            {isLoadingMessages ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">جاري تحميل الرسائل...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد رسائل</h3>
                <p className="text-gray-400">ابدأ المحادثة بإرسال رسالة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.sender_id === user.id;
                  const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2`}
                    >
                      {showAvatar && !isOwnMessage && (
                        <Avatar className="h-8 w-8 mt-auto">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {getInitials(message.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : message.sender_role === 'system'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-white text-gray-900 shadow-md border'
                        }`}
                      >
                        {!isOwnMessage && message.sender_role !== 'system' && (
                          <div className="text-xs font-medium opacity-75 mb-1">
                            {message.sender_name}
                          </div>
                        )}
                        
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        <div className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-white/60' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString('ar', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* منطقة إدخال الرسالة - مثبتة في الأسفل */}
          <div className="border-t bg-white p-4 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="h-12 rounded-full border-2 border-gray-200 focus:border-blue-400 px-4"
                  disabled={isLoading}
                  dir="rtl"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
              
              <Button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed p-0"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedChatWindow;
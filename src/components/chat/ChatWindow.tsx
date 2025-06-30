
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send, MessageSquare, Paperclip } from 'lucide-react';
import { Profile, ChatMessage, DesignOrder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { realChatService } from '@/services/chat/realChatService';

interface ChatWindowProps {
  user: Profile;
  order: DesignOrder;
  onClose: () => void;
}

const ChatWindow = ({ user, order, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    
    const unsubscribe = realChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received in chat window:', newMessage);
      setMessages(prev => {
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [order.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const orderMessages = await realChatService.getMessagesByOrderId(order.id);
      console.log('Loaded messages for order:', order.id, 'Count:', orderMessages.length);
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
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      console.log('=== CHAT WINDOW SENDING MESSAGE ===');
      console.log('User:', user.name, 'Role:', user.role, 'ID:', user.id);
      console.log('Order ID:', order.id);
      console.log('Message:', newMessage);
      
      const result = await realChatService.sendMessage({
        order_id: order.id,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: user.role as 'client' | 'admin' | 'designer' | 'system',
        content: newMessage,
        message_type: 'text'
      });

      if (!result.success) {
        console.error('Failed to send message:', result.error);
        throw new Error(result.error?.message || 'فشل في إرسال الرسالة');
      }

      console.log('Message sent successfully from chat window');
      setNewMessage('');
      
      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرسالة بنجاح",
      });
      
    } catch (error) {
      console.error('Error sending message from chat window:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: DesignOrder['status']) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'delivered': 'bg-purple-100 text-purple-800 border-purple-200'
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

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'client': 'عميل',
      'designer': 'مصمم',
      'admin': 'إدمن',
      'system': 'النظام'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[80vh] bg-white shadow-2xl flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <div>
              <CardTitle className="text-lg text-gray-900">
                دردشة الطلب: {order.design_type}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <span className="text-sm text-gray-500">
                  العميل: {order.client_name}
                </span>
                <span className="text-sm text-blue-600">
                  أنت: {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-red-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      message.sender_id === user.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : message.sender_role === 'system'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-white text-gray-900 shadow-md border'
                    }`}
                  >
                    {message.sender_role !== 'system' && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-75">
                          {message.sender_name} ({getRoleDisplayName(message.sender_role)})
                        </span>
                        <span className="text-xs opacity-60">
                          {new Date(message.created_at).toLocaleTimeString('ar', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="pr-12 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-400"
                  disabled={isLoading}
                  dir="rtl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ChatWindow;

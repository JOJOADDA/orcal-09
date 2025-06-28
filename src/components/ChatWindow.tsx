
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, User, Bot, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { ChatMessage, User as UserType, DesignOrder } from '@/types/chat';

interface ChatWindowProps {
  orderId: string;
  currentUser: UserType;
  onBack: () => void;
}

const ChatWindow = ({ orderId, currentUser, onBack }: ChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [order, setOrder] = useState<DesignOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    markMessagesAsRead();
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = () => {
    const orderData = chatService.getAllOrders().find(o => o.id === orderId);
    const orderMessages = chatService.getMessagesByOrderId(orderId);
    
    setOrder(orderData || null);
    setMessages(orderMessages);
  };

  const markMessagesAsRead = () => {
    chatService.markMessagesAsRead(orderId, currentUser.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setIsLoading(true);
    
    try {
      const message = chatService.sendMessage(orderId, currentUser.id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate admin response for demo
      if (currentUser.role === 'client') {
        setTimeout(() => {
          const adminResponse = chatService.sendMessage(
            orderId, 
            'admin-1', 
            'شكراً لتواصلك معنا! سنقوم بمراجعة طلبك والرد عليك قريباً.'
          );
          setMessages(prev => [...prev, adminResponse]);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: DesignOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'delivered':
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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

  const getStatusColor = (status: DesignOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <CardTitle className="text-xl">{order.designType}</CardTitle>
                  <p className="text-gray-600">الطلب #{order.id.slice(-8)}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Order Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">تاريخ الإنشاء:</span>
                <span className="mr-2">{new Date(order.createdAt).toLocaleString('ar-EG')}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">آخر تحديث:</span>
                <span className="mr-2">{new Date(order.updatedAt).toLocaleString('ar-EG')}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-semibold text-gray-700">التفاصيل:</span>
              <p className="text-gray-600 mt-1">{order.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === currentUser.id
                        ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white'
                        : message.type === 'system'
                        ? 'bg-gray-100 text-gray-700 border'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    {message.senderId !== currentUser.id && message.type !== 'system' && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          {message.senderRole === 'admin' ? (
                            <Bot className="w-3 h-3 text-white" />
                          ) : (
                            <User className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {message.senderName}
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 h-12"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                className="h-12 px-6 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatWindow;

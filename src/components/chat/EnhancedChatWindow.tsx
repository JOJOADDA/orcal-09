
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, Send, MessageSquare, Paperclip, Phone, Video, 
  MoreVertical, Smile, Image, FileText, Clock, Check, CheckCheck 
} from 'lucide-react';
import { Profile, ChatMessage, DesignOrder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { unifiedChatService } from '@/services/unifiedChatService';
import { cn } from '@/lib/utils';

interface EnhancedChatWindowProps {
  user: Profile;
  order: DesignOrder;
  onClose: () => void;
}

const EnhancedChatWindow = ({ user, order, onClose }: EnhancedChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received in EnhancedChatWindow:', newMessage);
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

    // Focus input on mount
    inputRef.current?.focus();

    return () => {
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
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);
    
    try {
      console.log('Sending message from:', user.name, 'Role:', user.role, 'Content:', messageContent.substring(0, 50));
      
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
      
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

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

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'client': 'عميل',
      'designer': 'مصمم',
      'admin': 'إدمن',
      'system': 'النظام'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ar', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('ar', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[85vh] bg-white shadow-2xl flex flex-col border-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
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
            <Separator orientation="vertical" className="h-6 bg-white/20" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-red-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 bg-gray-50">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
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
                  const showName = !isOwnMessage && showAvatar;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isOwnMessage && (
                        <Avatar className={cn("h-8 w-8 mt-1", !showAvatar && "invisible")}>
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {getInitials(message.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn("max-w-[70%] space-y-1", isOwnMessage && "items-end")}>
                        {showName && (
                          <div className="flex items-center gap-2 px-3">
                            <span className="text-xs font-medium text-gray-600">
                              {message.sender_name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getRoleDisplayName(message.sender_role)}
                            </Badge>
                          </div>
                        )}
                        
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2 max-w-full break-words",
                            isOwnMessage
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                              : message.sender_role === 'system'
                              ? "bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-bl-md"
                              : "bg-white text-gray-900 shadow-sm border border-gray-200 rounded-bl-md"
                          )}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                          
                          <div className={cn(
                            "flex items-center justify-end gap-1 mt-1",
                            isOwnMessage ? "text-white/70" : "text-gray-400"
                          )}>
                            <span className="text-xs">
                              {formatTime(message.created_at)}
                            </span>
                            {isOwnMessage && (
                              <div className="flex">
                                {message.is_read ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        ...
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-200 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك هنا..."
                  className="h-12 pr-12 pl-4 rounded-full border-2 border-gray-200 focus:border-blue-400 resize-none"
                  disabled={isLoading}
                  dir="rtl"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
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

export default EnhancedChatWindow;

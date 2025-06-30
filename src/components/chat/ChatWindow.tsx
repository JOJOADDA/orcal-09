
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Send, Paperclip, Mic, Phone, Video, User } from 'lucide-react';
import { Profile, ChatMessage, DesignOrder, OrderFile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { unifiedChatService } from '@/services/unifiedChatService';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received:', newMessage);
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
      
      if (newMessage.sender_id !== user.id) {
        playNotificationSound();
      }
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

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2YZCD2V2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2YZCD2V2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2YZCD2V2/LNeSsFJHfH8N2QQAoUXrTp66iJNwgZaLvt559N');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const orderMessages = await unifiedChatService.getMessages(order.id);
      setMessages(orderMessages);
      await unifiedChatService.markMessagesAsRead(order.id, user.id);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 5) {
      toast({
        title: "تحذير",
        description: "يمكنك رفع 5 ملفات كحد أقصى في المرة الواحدة",
        variant: "destructive"
      });
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<OrderFile[]> => {
    const uploadedFiles: OrderFile[] = [];
    
    for (const file of selectedFiles) {
      const uploadedFile = await unifiedChatService.uploadFile(file, order.id, user.id);
      if (uploadedFile) {
        uploadedFiles.push(uploadedFile);
      }
    }
    
    return uploadedFiles;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
    setIsTyping(true);
    
    try {
      const uploadedFiles = selectedFiles.length > 0 ? await uploadFiles() : [];
      
      let senderRole: 'client' | 'admin' | 'designer' | 'system';
      if (user.role === 'designer') {
        senderRole = 'designer';
      } else if (user.role === 'admin') {
        senderRole = 'admin';
      } else {
        senderRole = 'client';
      }
      
      const result = await unifiedChatService.sendMessage({
        order_id: order.id,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: senderRole,
        content: newMessage.trim() || `تم إرسال ${uploadedFiles.length} ملف(ات)`,
        message_type: uploadedFiles.length > 0 ? 'file' : 'text',
        files: uploadedFiles
      });

      if (!result.success) {
        throw result.error;
      }

      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getRoleText = (role: string) => {
    const roleMap = {
      'client': 'العميل',
      'admin': 'المدير',
      'designer': 'المصمم',
      'system': 'النظام'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 z-50">
      <Card className="w-full max-w-md h-full bg-white shadow-none flex flex-col border-0 rounded-none sm:max-w-lg sm:h-[90vh] sm:rounded-xl sm:border">
        {/* Telegram-style Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-[#517DA2] text-white shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {order.design_type}
                </h3>
                <p className="text-xs text-white/80">
                  آخر نشاط منذ دقائق
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
            >
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area - Telegram style background */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='telegram-bg' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='80' cy='80' r='2'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23telegram-bg)'/%3E%3C/svg%3E")`,
              backgroundColor: '#DCE2E8'
            }}
          >
            {isLoadingMessages ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#517DA2] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-500">جاري تحميل الرسائل...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#517DA2]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Send className="w-8 h-8 text-[#517DA2]" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد رسائل بعد</h3>
                <p className="text-gray-500">ابدأ محادثة جديدة</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%] group">
                    {/* Message bubble */}
                    <div
                      className={`relative px-4 py-2 shadow-sm ${
                        message.sender_id === user.id
                          ? 'bg-[#4CAF50] text-white rounded-2xl rounded-br-md ml-12'
                          : message.sender_role === 'system'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 rounded-2xl'
                          : 'bg-white text-gray-900 rounded-2xl rounded-bl-md mr-12'
                      }`}
                    >
                      {/* Sender name for received messages */}
                      {message.sender_role !== 'system' && message.sender_id !== user.id && (
                        <div className="text-xs font-medium text-[#517DA2] mb-1">
                          {message.sender_name} ({getRoleText(message.sender_role)})
                        </div>
                      )}
                      
                      {/* Message content */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      
                      {/* File attachment */}
                      {message.message_type === 'file' && (
                        <div className={`mt-2 p-2 rounded-lg ${
                          message.sender_id === user.id 
                            ? 'bg-black/10' 
                            : 'bg-gray-100'
                        }`}>
                          <div className="flex items-center gap-2 text-xs">
                            <Paperclip className="w-3 h-3" />
                            <span>ملف مرفق</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Time and status */}
                      <div className={`flex items-center gap-1 mt-1 justify-end ${
                        message.sender_id === user.id ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">
                          {formatTime(message.created_at)}
                        </span>
                        {message.sender_id === user.id && (
                          <div className="flex">
                            <div className="w-3 h-3 flex items-center justify-center">
                              <div className="text-xs">✓✓</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md p-3 mr-12 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="border-t bg-gray-50 p-3">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border text-xs">
                    <Paperclip className="w-3 h-3 text-[#517DA2]" />
                    <span className="truncate max-w-20">{file.name}</span>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Telegram style */}
          <div className="p-4 bg-white border-t">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
              />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
                disabled={isLoading}
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالة..."
                  className="rounded-3xl border-gray-300 pl-12 pr-4 py-3 h-12 bg-gray-50 focus:bg-white focus:border-[#517DA2] text-sm"
                  disabled={isLoading}
                  dir="rtl"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  disabled={isLoading}
                >
                  <Mic className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
              
              <Button
                type="submit"
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || isLoading}
                className="h-12 w-12 p-0 bg-[#4CAF50] hover:bg-[#45a049] rounded-full flex-shrink-0 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="w-5 h-5" />
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

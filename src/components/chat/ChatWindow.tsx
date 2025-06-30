
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send, MessageSquare, Paperclip, Download, Image, File, Phone, Video } from 'lucide-react';
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
    
    // الاشتراك في الرسائل الجديدة
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received:', newMessage);
      setMessages(prev => {
        // تجنب التكرار
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
      
      // إشعار صوتي للرسائل الجديدة
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
    // تشغيل صوت إشعار بسيط
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2YZCD2V2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2YZCD2V2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2YZCD2V2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+D2u2YZCD2V2/LNeSsFJHfH8N2QQAoUXrTp66iJNwgZaLvt559N');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // تجاهل الأخطاء
  };

  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const orderMessages = await unifiedChatService.getMessages(order.id);
      setMessages(orderMessages);
      
      // تمييز الرسائل كمقروءة
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
      // رفع الملفات أولاً إذا كانت موجودة
      const uploadedFiles = selectedFiles.length > 0 ? await uploadFiles() : [];
      
      // تحديد دور المرسل بشكل صحيح
      let senderRole: 'client' | 'admin' | 'designer' | 'system';
      if (user.role === 'designer') {
        senderRole = 'designer'; // استخدام designer مباشرة
      } else if (user.role === 'admin') {
        senderRole = 'admin';
      } else {
        senderRole = 'client';
      }
      
      // إرسال الرسالة
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

      // مسح النموذج
      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرسالة بنجاح",
        variant: "default"
      });
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

  const getStatusColor = (status: DesignOrder['status']) => {
    const colors = {
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'delivered': 'bg-purple-50 text-purple-700 border-purple-200'
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'client': 'text-blue-600',
      'admin': 'text-purple-600',
      'designer': 'text-green-600',
      'system': 'text-orange-600'
    };
    return colors[role as keyof typeof colors] || 'text-gray-600';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-5xl h-[85vh] bg-white shadow-2xl flex flex-col border-0 rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-full">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                دردشة الطلب: {order.design_type}
              </CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border bg-white/20 text-white border-white/30`}>
                  {getStatusText(order.status)}
                </span>
                <span className="text-sm text-white/80">
                  {new Date(order.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-white/20 text-white"
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-white/20 text-white"
            >
              <Video className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 hover:bg-red-500/20 text-white border border-white/30 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {isLoadingMessages ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                <p className="text-gray-500 text-lg">جاري تحميل الرسائل...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">لا توجد رسائل بعد</h3>
                <p className="text-gray-500">ابدأ محادثة جديدة مع الطرف الآخر</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
                >
                  <div
                    className={`max-w-[75%] ${
                      message.sender_id === user.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl rounded-br-lg'
                        : message.sender_role === 'system'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl'
                        : 'bg-white text-gray-900 shadow-lg border border-gray-100 rounded-3xl rounded-bl-lg'
                    } p-4 relative group`}
                  >
                    {message.sender_role !== 'system' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold ${
                          message.sender_id === user.id ? 'text-white/90' : getRoleColor(message.sender_role)
                        }`}>
                          {message.sender_name} ({getRoleText(message.sender_role)})
                        </span>
                        <span className={`text-xs ${
                          message.sender_id === user.id ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    
                    {message.message_type === 'file' && (
                      <div className={`mt-3 p-3 rounded-xl ${
                        message.sender_id === user.id 
                          ? 'bg-white/20' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {getFileIcon('file')}
                          <span className="text-xs font-medium">ملف مرفق</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 ml-auto"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* مؤشر الكتابة */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 rounded-3xl rounded-bl-lg p-4 animate-pulse">
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
            <div className="border-t bg-gray-50 p-4">
              <div className="flex flex-wrap gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border text-sm group">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-900">{file.name}</p>
                      <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                      className="h-6 w-6 p-0 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t bg-white p-6">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
              />
              
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="pr-14 h-14 rounded-2xl border-2 border-gray-200 focus:border-blue-400 text-base bg-gray-50 focus:bg-white transition-all"
                  disabled={isLoading}
                  dir="rtl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-blue-100 rounded-full"
                  disabled={isLoading}
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
              
              <Button
                type="submit"
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || isLoading}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
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

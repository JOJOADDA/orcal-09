
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send, MessageSquare, Paperclip, Image, File, AlertCircle } from 'lucide-react';
import { Profile, ChatMessage, DesignOrder, MessageFile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { unifiedChatService } from '@/services/unified/unifiedChatService';
import { unifiedFileService } from '@/services/unified/unifiedFileService';
import MessageFileDisplay from './MessageFileDisplay';

interface UnifiedChatWindowProps {
  user: Profile;
  order: DesignOrder;
  onClose: () => void;
}

const UnifiedChatWindow = ({ user, order, onClose }: UnifiedChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageFiles, setMessageFiles] = useState<Record<string, MessageFile[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('UnifiedChatWindow mounted for order:', order.id);
    console.log('User:', user.name, 'Role:', user.role);
    
    loadMessages();
    
    const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (newMessage) => {
      console.log('New message received:', newMessage);
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
      
      // Load files for the new message if it's a file message
      if (newMessage.message_type === 'file') {
        loadMessageFiles(newMessage.id);
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

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true);
      setError(null);
      
      console.log('Loading messages for order:', order.id);
      const orderMessages = await unifiedChatService.getMessages(order.id);
      
      console.log('Loaded messages:', orderMessages.length);
      setMessages(orderMessages);
      
      // Load files for each message
      for (const message of orderMessages) {
        if (message.message_type === 'file') {
          await loadMessageFiles(message.id);
        }
      }
      
      await unifiedChatService.markMessagesAsRead(order.id, user.id);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('فشل في تحميل الرسائل');
      toast({
        title: "خطأ",
        description: "فشل في تحميل الرسائل",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadMessageFiles = async (messageId: string) => {
    try {
      const files = await unifiedFileService.getMessageFiles(messageId);
      setMessageFiles(prev => ({
        ...prev,
        [messageId]: files
      }));
    } catch (error) {
      console.error('Error loading message files:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      console.log('Selected files:', files.map(f => f.name));
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending message...');
      console.log('User ID:', user.id);
      console.log('User Role:', user.role);
      console.log('Order ID:', order.id);
      
      const senderRole = user.role === 'designer' ? 'admin' : user.role as 'client' | 'admin' | 'system';
      
      const result = await unifiedChatService.sendMessage({
        order_id: order.id,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: senderRole,
        content: newMessage.trim() || `تم إرسال ${selectedFiles.length} ملف(ات)`,
        message_type: selectedFiles.length > 0 ? 'file' : 'text',
        files: selectedFiles
      });

      if (!result.success) {
        throw result.error;
      }

      console.log('Message sent successfully');
      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرسالة بنجاح"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('فشل في إرسال الرسالة');
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
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

  const getFileIcon = (fileName: string) => {
    if (unifiedFileService.isImageFile(fileName)) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
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
                  {new Date(order.created_at).toLocaleDateString('ar')}
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
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 ml-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

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
                <p className="text-gray-400">ابدأ محادثة جديدة</p>
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
                          {message.sender_name}
                        </span>
                        <span className="text-xs opacity-60">
                          {new Date(message.created_at).toLocaleTimeString('ar', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed mb-2">{message.content}</p>
                    
                    {message.message_type === 'file' && messageFiles[message.id] && (
                      <MessageFileDisplay files={messageFiles[message.id]} />
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedFiles.length > 0 && (
            <div className="border-t bg-gray-50 p-2">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 text-sm">
                    {getFileIcon(file.name)}
                    <span className="truncate max-w-32">{file.name}</span>
                    <span className="text-gray-500">({unifiedFileService.formatFileSize(file.size)})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt"
              />
              
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
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || isLoading}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl"
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

export default UnifiedChatWindow;

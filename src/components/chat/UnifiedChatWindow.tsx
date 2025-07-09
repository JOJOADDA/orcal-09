import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, Send, MessageSquare, Zap, Paperclip } from 'lucide-react';
import { Profile, DesignOrder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useLightningChat } from '@/hooks/useLightningChat';
import { cn } from '@/lib/utils';
import { unifiedChatService } from '@/services/unifiedChatService';

interface UnifiedChatWindowProps {
  user: Profile;
  order: DesignOrder;
  onClose: () => void;
}

const UnifiedChatWindow = ({ user, order, onClose }: UnifiedChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // استخدام hook الدردشة الأسرع
  const {
    messages,
    isLoading,
    isLoadingMessages,
    onlineStatus,
    messagesEndRef,
    sendMessage,
    isTyping
  } = useLightningChat({ user, order });

  // إرسال رسالة أو ملف
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isLoading || uploading) return;
    if (selectedFile) {
      setUploading(true);
      try {
        const uploaded = await unifiedChatService.uploadFile(selectedFile, order.id, user.id);
        if (uploaded) {
          await sendMessage(`[ملف]: ${uploaded.name}\n${uploaded.url}`, 'file');
          setSelectedFile(null);
        } else {
          toast({ title: 'خطأ في رفع الملف', description: 'تعذر رفع الملف. حاول مرة أخرى.', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'خطأ في رفع الملف', description: 'حدث خطأ غير متوقع.', variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    } else if (newMessage.trim()) {
      const messageContent = newMessage.trim();
      setNewMessage('');
      const success = await sendMessage(messageContent);
      if (!success) {
        setNewMessage(messageContent);
        toast({ title: 'خطأ في الإرسال', description: 'تعذر إرسال الرسالة. حاول مرة أخرى.', variant: 'destructive' });
      } else {
        inputRef.current?.focus();
      }
    }
  };

  // ألوان وحالة الطلب
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
        {/* Header */}
        <div className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10 p-2">
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
                <Badge className={getStatusColor(order.status) + ' text-xs text-white border-white/20'}>
                  {getStatusText(order.status)}
                </Badge>
                <Badge className="bg-green-500/20 text-green-200 border-green-300/20 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  سريع
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span>العميل: {order.client_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <div className={cn('w-2 h-2 rounded-full', onlineStatus ? 'bg-green-400 animate-pulse' : 'bg-gray-400')} />
                  {onlineStatus ? 'متصل' : 'غير متصل'}
                </span>
                <span>•</span>
                <span className="text-xs">رسائل: {messages.length}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-red-500/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardContent className="flex-1 flex flex-col p-0 bg-gray-50">
          {/* منطقة الرسائل */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
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
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2`}>
                      {showAvatar && !isOwnMessage && (
                        <Avatar className="h-8 w-8 mt-auto">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {getInitials(message.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] rounded-2xl p-3 ${isOwnMessage ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : message.sender_role === 'system' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-white text-gray-800 border border-gray-200'}`}>
                        {message.content}
                        <div className="text-xs text-gray-400 mt-1 text-left ltr:text-right rtl:text-left">
                          {message.sender_name}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">...</div>
                    <span className="text-gray-500 text-sm">يكتب الآن...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
            {/* chatError && (
              <div className="text-center text-red-500 mt-2">{chatError}</div>
            ) */}
          </ScrollArea>
          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
              <Button
                type="button"
                className="h-12 w-12 rounded-full bg-gray-100 hover:bg-gray-200 p-0 flex items-center justify-center"
                disabled={isLoading || uploading}
                onClick={() => {
                  if (!uploading) {
                    document.getElementById('chat-file-input')?.click();
                  }
                }}
                aria-label="إرفاق ملف"
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </Button>
              <input
                id="chat-file-input"
                type="file"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-zip-compressed,.rar,.zip,.7z,.txt,.doc,.docx"
              />
              {selectedFile && (
                <div className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1 flex items-center gap-2">
                  <span>{selectedFile.name}</span>
                  <Button type="button" size="sm" variant="ghost" className="p-1" onClick={() => setSelectedFile(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="h-12 rounded-full border-2 border-gray-200 focus:border-blue-400"
                  disabled={isLoading || uploading}
                  dir="rtl"
                  maxLength={1000}
                />
              </div>
              <Button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || isLoading || uploading}
                className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed p-0"
              >
                {(isLoading || uploading) ? (
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
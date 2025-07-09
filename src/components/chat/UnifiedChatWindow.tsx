import React from 'react';
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
import Picker from 'emoji-mart/dist/components/picker/picker';
import 'emoji-mart/css/emoji-mart.css';
import { FixedSizeList as List } from 'react-window';
import { useEffect } from 'react';
import type { ListOnScrollProps } from 'react-window';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<null | { id: string; sender: string; content: string }> (null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  // عدد الرسائل المعروضة (للتجربة، اجلب 20 رسالة في كل مرة)
  const [visibleCount, setVisibleCount] = useState(30);
  const [isDragging, setIsDragging] = useState(false);

  // دالة وهمية لجلب الرسائل القديمة (يجب ربطها لاحقًا مع unifiedChatService)
  const loadOlderMessages = async () => {
    setLoadingOlder(true);
    // محاكاة تحميل المزيد
    await new Promise(res => setTimeout(res, 700));
    setVisibleCount(c => c + 20);
    setLoadingOlder(false);
  };

  // مراقبة التمرير للأعلى
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop < 40 && !loadingOlder) {
      loadOlderMessages();
    }
  };

  // أنواع الملفات المسموحة
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip', 'application/x-zip-compressed',
    'text/plain',
  ];

  // معالجة السحب والإفلات
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'نوع الملف غير مدعوم', description: 'يرجى رفع صورة أو ملف مستند أو مضغوط أو نصي فقط.', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
  };

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
    let replyPrefix = '';
    if (replyTo) {
      replyPrefix = `[رد على: ${replyTo.sender}]: ${replyTo.content}\n`;
    }
    if (selectedFile) {
      setUploading(true);
      try {
        const uploaded = await unifiedChatService.uploadFile(selectedFile, order.id, user.id);
        if (uploaded) {
          await sendMessage(replyPrefix + `[ملف]: ${uploaded.name}\n${uploaded.url}`, 'file');
          setSelectedFile(null);
          setReplyTo(null);
        } else {
          toast({ title: 'خطأ في رفع الملف', description: 'تعذر رفع الملف. حاول مرة أخرى.', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'خطأ في رفع الملف', description: 'حدث خطأ غير متوقع.', variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    } else if (newMessage.trim()) {
      const messageContent = replyPrefix + newMessage.trim();
      setNewMessage('');
      setReplyTo(null);
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

  // إدراج رمز تعبيري في الموضع الحالي للمؤشر
  const insertEmoji = (emoji: any) => {
    const emojiChar = emoji.native;
    const input = inputRef.current;
    if (!input) {
      setNewMessage(prev => prev + emojiChar);
      return;
    }
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = newMessage.slice(0, start) + emojiChar + newMessage.slice(end);
    setNewMessage(newValue);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emojiChar.length, start + emojiChar.length);
    }, 0);
  };

  // مرجع للـ List الافتراضية
  const listRef = useRef<any>(null);
  // تتبع آخر عدد للرسائل
  const prevMessagesLength = useRef(messages.length);

  // تمرير تلقائي عند وصول رسالة جديدة أو إرسال رسالة
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      // عند إضافة رسالة جديدة، مرر لآخر رسالة
      listRef.current?.scrollToItem(messages.slice(-visibleCount).length - 1, 'end');
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, visibleCount]);

  // عند تحميل رسائل قديمة، حافظ على موضع التمرير (لا تقفز للأسفل)
  // (react-window يحافظ تلقائيًا على الموضع إذا لم يتغير itemCount بشكل كبير)

  return (
    <div
      className={
        `fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${isDragging ? 'ring-4 ring-blue-400/60' : ''}`
      }
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ transition: 'box-shadow 0.2s' }}
    >
      <Card className="w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white dark:from-gray-800 dark:to-gray-900">
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
        <CardContent className="flex-1 flex flex-col p-0 bg-gray-50 dark:bg-gray-800">
          {/* منطقة الرسائل */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4" onScroll={handleScroll}>
            {loadingOlder && (
              <div className="text-center py-2 text-xs text-gray-400">جاري تحميل رسائل أقدم...</div>
            )}
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
              <List
                ref={listRef}
                height={500}
                itemCount={messages.slice(-visibleCount).length}
                itemSize={110}
                width={"100%"}
                className="space-y-4"
              >
                {({ index, style }) => {
                  const message = messages.slice(-visibleCount)[index];
                  const isOwnMessage = message.sender_id === user.id;
                  const showAvatar = !isOwnMessage && (index === 0 || messages.slice(-visibleCount)[index - 1]?.sender_id !== message.sender_id);
                  const isFile = message.message_type === 'file' || message.content.startsWith('[ملف]:');
                  let fileUrl = '';
                  let fileName = '';
                  if (isFile) {
                    const match = message.content.match(/\[ملف\]: (.+)\n(.+)/);
                    if (match) {
                      fileName = match[1];
                      fileUrl = match[2];
                    }
                  }
                  let replyBlock = null;
                  let contentWithoutReply = message.content;
                  const replyMatch = message.content.match(/^\[رد على: (.+?)\]: ([^\n]+)\n([\s\S]*)/);
                  if (replyMatch) {
                    replyBlock = { sender: replyMatch[1], content: replyMatch[2] };
                    contentWithoutReply = replyMatch[3];
                  }
                  return (
                    <div style={style} key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} gap-2 group relative`}>
                      {showAvatar && !isOwnMessage && (
                        <Avatar className="h-8 w-8 mt-auto">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {getInitials(message.sender_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 break-words shadow-md ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white dark:from-blue-700 dark:to-purple-800'
                            : message.sender_role === 'system'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-200 dark:text-yellow-900'
                            : 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'
                        }`}
                      >
                        {replyBlock && (
                          <div className="mb-2 p-2 rounded bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 border-l-4 border-blue-400">
                            <span className="font-bold">رد على: {replyBlock.sender}</span>
                            <div className="truncate">{replyBlock.content}</div>
                          </div>
                        )}
                        {isFile && fileUrl ? (
                          <div className="flex flex-col gap-2">
                            {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img src={fileUrl} alt={fileName} className="rounded-lg max-h-48 max-w-full object-contain border mb-1" />
                            ) : (
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-300">{fileName || 'ملف مرفق'}</a>
                            )}
                            <div className="text-xs text-gray-400 mt-1 text-left ltr:text-right rtl:text-left">
                              {message.sender_name}
                            </div>
                          </div>
                        ) : (
                          <>
                            {contentWithoutReply}
                            <div className="text-xs text-gray-400 mt-1 text-left ltr:text-right rtl:text-left">
                              {message.sender_name}
                            </div>
                          </>
                        )}
                      </div>
                      {/* زر الرد */}
                      <button
                        type="button"
                        className="absolute -top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-1 shadow hover:bg-blue-100 dark:hover:bg-blue-900"
                        title="رد"
                        onClick={() => setReplyTo({ id: message.id, sender: message.sender_name, content: isFile ? (fileName || 'ملف') : contentWithoutReply })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                    </div>
                  );
                }}
              </List>
            )}
            {isTyping && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">...</div>
                <span className="text-gray-500 text-sm">يكتب الآن...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <div className="border-t bg-white p-4">
            {/* معاينة الرد */}
            {replyTo && (
              <div className="mb-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 rounded p-2 text-xs text-blue-800 dark:text-blue-200">
                <span className="font-bold">رد على: {replyTo.sender}</span>
                <span className="truncate">{replyTo.content}</span>
                <button type="button" className="ml-auto text-blue-400 hover:text-blue-700" onClick={() => setReplyTo(null)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
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
              <Button
                type="button"
                className="h-12 w-12 rounded-full bg-gray-100 hover:bg-gray-200 p-0 flex items-center justify-center"
                onClick={() => setShowEmojiPicker(v => !v)}
                aria-label="إدراج رمز تعبيري"
                disabled={isLoading || uploading}
              >
                <span role="img" aria-label="emoji">😊</span>
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-0 z-50">
                  <Picker
                    set="apple"
                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                    onSelect={insertEmoji}
                    showPreview={false}
                    showSkinTones={false}
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
                  />
                </div>
              )}
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
                  {selectedFile.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(selectedFile)} alt={selectedFile.name} className="w-10 h-10 object-cover rounded mr-2 border" />
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="bg-blue-200 text-blue-700 rounded px-1 py-0.5 text-xs">{selectedFile.name.split('.').pop()?.toUpperCase()}</span>
                      <span>{selectedFile.name}</span>
                    </span>
                  )}
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
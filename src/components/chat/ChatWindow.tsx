
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { Profile, DesignOrder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/useChat';
import ChatHeader from './ChatHeader';
import ChatMessageBubble from './ChatMessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  user: Profile;
  order: DesignOrder;
  onClose: () => void;
}

const ChatWindow = ({ user, order, onClose }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    messages,
    isLoading,
    isLoadingMessages,
    isTyping,
    onlineStatus,
    messagesEndRef,
    sendMessage
  } = useChat({ user, order });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    const success = await sendMessage(messageContent);
    
    if (!success) {
      setNewMessage(messageContent); // Restore message on error
    }
    
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl h-[85vh] bg-white shadow-2xl flex flex-col border-0 overflow-hidden">
        <ChatHeader
          order={order}
          user={user}
          onlineStatus={onlineStatus}
          onClose={onClose}
          onCall={() => toast({ title: "المكالمة الصوتية", description: "هذه الميزة قيد التطوير" })}
          onVideoCall={() => toast({ title: "مكالمة الفيديو", description: "هذه الميزة قيد التطوير" })}
          onSettings={() => toast({ title: "الإعدادات", description: "هذه الميزة قيد التطوير" })}
        />
        
        <CardContent className="flex-1 flex flex-col p-0 bg-gray-50">
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
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      showAvatar={showAvatar}
                      showName={showName}
                      currentUserId={user.id}
                    />
                  );
                })}
                
                {isTyping && (
                  <TypingIndicator
                    senderName="المصمم"
                    senderInitials="م"
                  />
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="border-t bg-white p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك هنا..."
                  className="h-12 rounded-full border-2 border-gray-200 focus:border-blue-400"
                  disabled={isLoading}
                  dir="rtl"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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


import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { ChatMessage as ChatMessageType, Profile } from '@/types/database';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  user: Profile;
  isLoadingMessages: boolean;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages = ({ messages, user, isLoadingMessages, isTyping, messagesEndRef }: ChatMessagesProps) => {
  if (isLoadingMessages) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">جاري تحميل الرسائل...</p>
        </div>
      </ScrollArea>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد رسائل</h3>
          <p className="text-gray-400">ابدأ المحادثة بإرسال رسالة</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender_id === user.id;
          const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
          const showName = !isOwnMessage && showAvatar;
          
          return (
            <ChatMessage
              key={message.id}
              message={message}
              user={user}
              showAvatar={showAvatar}
              showName={showName}
            />
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
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatMessages;

import { memo, useMemo } from 'react';
import { MessageSquare, Clock, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage, Profile } from '@/types/database';

interface OptimizedMessageBubbleProps {
  message: ChatMessage;
  user: Profile;
  isConsecutive?: boolean;
}

// مكون محسن لعرض الرسائل مع منع إعادة الرندر غير الضروري
const OptimizedMessageBubble = memo(({ message, user, isConsecutive = false }: OptimizedMessageBubbleProps) => {
  const isOwnMessage = message.sender_id === user.id;
  
  // تحسين حساب الوقت مع useMemo
  const messageTime = useMemo(() => {
    const date = new Date(message.created_at);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, [message.created_at]);

  // تحسين أيقونة الحالة مع useMemo
  const statusIcon = useMemo(() => {
    if (!isOwnMessage) return null;
    
    if (message.is_read) {
      return <Check className="w-3 h-3 text-blue-500" />;
    }
    return <Clock className="w-3 h-3 text-gray-400" />;
  }, [isOwnMessage, message.is_read]);

  // تحسين حساب الألوان مع useMemo
  const bubbleStyles = useMemo(() => {
    if (isOwnMessage) {
      return "bg-blue-500 text-white ml-auto";
    }
    
    // ألوان مختلفة حسب نوع المرسل
    switch (message.sender_role) {
      case 'designer':
        return "bg-green-100 text-green-900 border border-green-200";
      case 'admin':
        return "bg-purple-100 text-purple-900 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-900 border border-gray-200";
    }
  }, [isOwnMessage, message.sender_role]);

  return (
    <div className={cn(
      "flex flex-col max-w-[80%] group",
      isOwnMessage ? "items-end" : "items-start",
      isConsecutive ? "mt-1" : "mt-4"
    )}>
      {/* اسم المرسل (للرسائل من الآخرين) */}
      {!isOwnMessage && !isConsecutive && (
        <div className="flex items-center gap-1 mb-1 px-1">
          <span className="text-xs font-medium text-gray-600">
            {message.sender_name}
          </span>
          {message.sender_role === 'designer' && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
              مصمم
            </span>
          )}
          {message.sender_role === 'admin' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
              إدارة
            </span>
          )}
        </div>
      )}
      
      {/* فقاعة الرسالة */}
      <div className={cn(
        "relative px-4 py-2 rounded-2xl shadow-sm transition-all duration-200",
        "group-hover:shadow-md",
        bubbleStyles,
        isOwnMessage ? "rounded-br-sm" : "rounded-bl-sm"
      )}>
        {/* محتوى الرسالة */}
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </p>
        
        {/* الوقت وحالة القراءة */}
        <div className={cn(
          "flex items-center justify-end gap-1 mt-1",
          isOwnMessage ? "text-blue-100" : "text-gray-500"
        )}>
          <span className="text-xs opacity-75">
            {messageTime}
          </span>
          {statusIcon}
        </div>
      </div>
    </div>
  );
});

OptimizedMessageBubble.displayName = 'OptimizedMessageBubble';

export default OptimizedMessageBubble;

import { useEffect, useState } from 'react';
import { Toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, X } from 'lucide-react';
import { ChatMessage } from '@/types/database';
import { cn } from '@/lib/utils';

interface ChatNotificationProps {
  message: ChatMessage;
  onClose: () => void;
  onOpenChat: () => void;
  autoHide?: boolean;
  duration?: number;
}

const ChatNotification = ({ 
  message, 
  onClose, 
  onOpenChat, 
  autoHide = true, 
  duration = 5000 
}: ChatNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 transition-all duration-300 transform",
      isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    )}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm min-w-[300px]">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {getInitials(message.sender_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-sm text-gray-900">
                رسالة جديدة
              </span>
            </div>
            
            <p className="text-sm font-medium text-gray-700 mb-1">
              {message.sender_name}
            </p>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {message.content}
            </p>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={onOpenChat}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
              >
                فتح الدردشة
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                تجاهل
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatNotification;

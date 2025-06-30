
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck, Clock, Download, Eye } from 'lucide-react';
import { ChatMessage } from '@/types/database';
import { cn } from '@/lib/utils';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showName?: boolean;
  currentUserId: string;
}

const ChatMessageBubble = ({ 
  message, 
  isOwnMessage, 
  showAvatar = false, 
  showName = false,
  currentUserId 
}: ChatMessageBubbleProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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

  return (
    <div className={cn("flex gap-3", isOwnMessage ? "justify-end" : "justify-start")}>
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
};

export default ChatMessageBubble;

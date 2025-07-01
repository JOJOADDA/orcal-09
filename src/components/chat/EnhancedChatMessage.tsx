import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types/database';
import { cn } from '@/lib/utils';

interface EnhancedChatMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showName?: boolean;
  currentUserId: string;
  currentUserRole: string;
}

const EnhancedChatMessage = ({ 
  message, 
  isOwnMessage, 
  showAvatar = false, 
  showName = false,
  currentUserId,
  currentUserRole
}: EnhancedChatMessageProps) => {
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

  const getRoleColor = (role: string) => {
    const roleColors = {
      'client': 'bg-blue-100 text-blue-600',
      'designer': 'bg-green-100 text-green-600',
      'admin': 'bg-purple-100 text-purple-600',
      'system': 'bg-yellow-100 text-yellow-600'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-600';
  };

  const getMessageStyle = () => {
    if (isOwnMessage) {
      // رسائل المستخدم الحالي - دائماً زرقاء على اليمين
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md ml-8";
    }
    
    if (message.sender_role === 'system') {
      return "bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg";
    }
    
    if (message.sender_role === 'designer') {
      // رسائل المصمم - خضراء على اليسار
      return "bg-gradient-to-r from-green-500 to-green-600 text-white rounded-bl-md mr-8";
    }
    
    if (message.sender_role === 'admin') {
      // رسائل الأدمن - بنفسجية على اليسار
      return "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-bl-md mr-8";
    }
    
    // رسائل العميل - رمادية على اليسار
    return "bg-white text-gray-900 shadow-sm border border-gray-200 rounded-bl-md mr-8";
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

  const containerDirection = isOwnMessage ? "justify-end" : "justify-start";
  const avatarOrder = isOwnMessage ? "order-2" : "order-1";
  const messageOrder = isOwnMessage ? "order-1" : "order-2";

  return (
    <div className={cn("flex gap-3 mb-4", containerDirection)}>
      {!isOwnMessage && (
        <Avatar className={cn("h-8 w-8 mt-1 flex-shrink-0", avatarOrder, !showAvatar && "invisible")}>
          <AvatarFallback className={getRoleColor(message.sender_role)}>
            {getInitials(message.sender_name)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("max-w-[70%] space-y-1", messageOrder, isOwnMessage && "items-end")}>
        {showName && !isOwnMessage && (
          <div className="flex items-center gap-2 px-3">
            <span className="text-xs font-medium text-gray-600">
              {message.sender_name}
            </span>
            <Badge variant="outline" className="text-xs">
              {getRoleDisplayName(message.sender_role)}
            </Badge>
          </div>
        )}
        
        <div className={cn("rounded-2xl px-4 py-3 max-w-full break-words", getMessageStyle())}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          <div className={cn(
            "flex items-center gap-1 mt-2",
            isOwnMessage ? "justify-end text-white/70" : "justify-end text-gray-400"
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

export default EnhancedChatMessage;
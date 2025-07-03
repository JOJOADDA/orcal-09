import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/database';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppNotificationProps {
  message: ChatMessage;
  onOpenChat: () => void;
  onClose: () => void;
}

const WhatsAppNotification: React.FC<WhatsAppNotificationProps> = ({
  message,
  onOpenChat,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // إظهار الإشعار بحركة انزلاق
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOpenChat = () => {
    onOpenChat();
    handleClose();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getSenderIcon = (role: string) => {
    switch (role) {
      case 'designer':
        return '🎨';
      case 'admin':
        return '👨‍💼';
      case 'client':
        return '👤';
      default:
        return '💬';
    }
  };

  return (
    <div
      className={cn(
        "w-80 max-w-sm transform transition-all duration-300 ease-out",
        isVisible && !isLeaving 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
      )}
    >
      {/* تصميم مشابه لإشعار الواتساب */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200" 
           style={{ boxShadow: 'var(--notification-shadow)' }}>
        {/* شريط علوي أخضر مشابه للواتساب */}
        <div className="h-1 bg-gradient-to-r from-green-500 to-green-600" 
             style={{ backgroundColor: `hsl(var(--whatsapp-green))` }}></div>
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* أفاتار المرسل */}
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-green-100">
                <AvatarFallback className="bg-green-500 text-white text-sm font-semibold">
                  {getInitials(message.sender_name)}
                </AvatarFallback>
              </Avatar>
            {/* أيقونة نوع المرسل */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 flex items-center justify-center text-xs"
                 style={{ borderColor: `hsl(var(--whatsapp-green))` }}>
              {getSenderIcon(message.sender_role)}
            </div>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* اسم المرسل والوقت */}
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {message.sender_name}
                </h3>
                <span className="text-xs text-gray-500 ml-2">
                  {formatTime(message.created_at)}
                </span>
              </div>
              
              {/* نوع المرسل */}
              <div className="flex items-center gap-1 mb-2">
                <MessageSquare className="w-3 h-3" style={{ color: `hsl(var(--whatsapp-green))` }} />
                <span className="text-xs text-gray-500">
                  {message.sender_role === 'designer' ? 'مصمم' : 
                   message.sender_role === 'admin' ? 'إدارة' : 'عميل'}
                </span>
              </div>
              
              {/* محتوى الرسالة */}
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed mb-3">
                {message.content}
              </p>
              
              {/* أزرار التفاعل */}
              <div className="flex gap-2">
                <button
                  onClick={handleOpenChat}
                  className="flex-1 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1 hover:opacity-90"
                  style={{ 
                    backgroundColor: `hsl(var(--whatsapp-green))`
                  }}
                >
                  <MessageSquare className="w-3 h-3" />
                  فتح الدردشة
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200"
                >
                  تجاهل
                </button>
              </div>
            </div>
            
            {/* زر الإغلاق */}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* شريط تقدم الوقت */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full animate-pulse"
            style={{
              backgroundColor: `hsl(var(--whatsapp-green))`,
              animation: 'shrink 8s linear forwards'
            }}
          ></div>
        </div>
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppNotification;
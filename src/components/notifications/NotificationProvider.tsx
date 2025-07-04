import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '@/types/database';
import { pushNotificationService } from '@/services/notifications/pushNotificationService';
import WhatsAppNotification from './WhatsAppNotification';
import NotificationPermissionPrompt from './NotificationPermissionPrompt';

interface NotificationContextType {
  showNotification: (message: ChatMessage, onOpenChat: () => void, orderId?: string) => void;
  hideNotification: (messageId: string) => void;
  playNotificationSound: () => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface ActiveNotification {
  id: string;
  message: ChatMessage;
  onOpenChat: () => void;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<ActiveNotification[]>([]);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  useEffect(() => {
    // التحقق من إذن الإشعارات عند تحميل المكون
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const hasPermission = await pushNotificationService.isPermissionGranted();
    setHasNotificationPermission(hasPermission);
    setHasCheckedPermission(true);
    
    // إظهار مربع طلب الإذن إذا لم يكن ممنوحاً ولم يتم رفضه من قبل
    if (!hasPermission && Notification.permission === 'default') {
      // انتظار قليل قبل إظهار الطلب لتحسين تجربة المستخدم
      setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 3000);
    }
  };

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    const granted = await pushNotificationService.checkAndRequestPermission();
    setHasNotificationPermission(granted);
    return granted;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      // إنشاء صوت إشعار مشابه للواتساب
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // تردد الصوت مشابه لإشعار الواتساب
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification not supported:', error);
    }
  }, []);

  const showNotification = useCallback(async (message: ChatMessage, onOpenChat: () => void, orderId?: string) => {
    // إضافة الإشعار الجديد
    const newNotification: ActiveNotification = {
      id: message.id,
      message,
      onOpenChat
    };

    setNotifications(prev => {
      // إزالة الإشعارات القديمة للرسالة نفسها
      const filtered = prev.filter(n => n.id !== message.id);
      return [...filtered, newNotification];
    });

    // إرسال إشعار نظام التشغيل إذا كان الإذن ممنوح
    if (hasNotificationPermission && orderId) {
      try {
        await pushNotificationService.showNotification(message, orderId);
      } catch (error) {
        console.error('Error showing system notification:', error);
      }
    }

    // تشغيل صوت الإشعار
    playNotificationSound();

    // إخفاء الإشعار الداخلي تلقائياً بعد 8 ثوان
    setTimeout(() => {
      hideNotification(message.id);
    }, 8000);
  }, [playNotificationSound, hasNotificationPermission]);

  const hideNotification = useCallback((messageId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== messageId));
  }, []);

  return (
    <NotificationContext.Provider value={{
      showNotification,
      hideNotification,
      playNotificationSound,
      requestNotificationPermission
    }}>
      {children}
      
      {/* عرض الإشعارات */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {notifications.map((notification) => (
          <WhatsAppNotification
            key={notification.id}
            message={notification.message}
            onOpenChat={notification.onOpenChat}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </div>

      {/* مربع طلب إذن الإشعارات */}
      {showPermissionPrompt && (
        <NotificationPermissionPrompt
          onClose={() => setShowPermissionPrompt(false)}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
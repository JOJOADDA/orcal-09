import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatMessage } from '@/types/database';
import WhatsAppNotification from './WhatsAppNotification';

interface NotificationContextType {
  showNotification: (message: ChatMessage, onOpenChat: () => void) => void;
  hideNotification: (messageId: string) => void;
  playNotificationSound: () => void;
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

  const showNotification = useCallback((message: ChatMessage, onOpenChat: () => void) => {
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

    // تشغيل صوت الإشعار
    playNotificationSound();

    // إخفاء الإشعار تلقائياً بعد 8 ثوان
    setTimeout(() => {
      hideNotification(message.id);
    }, 8000);
  }, [playNotificationSound]);

  const hideNotification = useCallback((messageId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== messageId));
  }, []);

  return (
    <NotificationContext.Provider value={{
      showNotification,
      hideNotification,
      playNotificationSound
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
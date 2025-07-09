import { useState, useEffect, useCallback } from 'react';
import { NotificationService, Notification } from '@/services/admin/NotificationService';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // تحميل الإشعارات
  const loadNotifications = useCallback(async () => {
    try {
      const [allNotifications, unreadNotifications] = await Promise.all([
        NotificationService.getUserNotifications(userId, false, 20),
        NotificationService.getUserNotifications(userId, true)
      ]);

      setNotifications(allNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // تحديد إشعار كمقروء
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await NotificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true, read_at: new Date().toISOString() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await NotificationService.markAllAsRead(userId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            is_read: true,
            read_at: new Date().toISOString()
          }))
        );
        setUnreadCount(0);
        toast({
          title: "تم",
          description: "تم تحديد جميع الإشعارات كمقروءة",
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإشعارات",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  // إضافة إشعار جديد
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }

    // عرض toast للإشعارات عالية الأولوية
    if (notification.priority === 'high' || notification.priority === 'critical') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
        duration: notification.priority === 'critical' ? 10000 : 5000
      });
    }
  }, [toast]);

  // الاشتراك في الإشعارات الفورية
  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    const unsubscribe = NotificationService.subscribeToNotifications(userId, addNotification);

    return () => {
      unsubscribe();
    };
  }, [userId, loadNotifications, addNotification]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications
  };
};
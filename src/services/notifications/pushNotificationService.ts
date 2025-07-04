import { ChatMessage } from '@/types/database';

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = false;

  constructor() {
    this.init();
  }

  private async init() {
    // التحقق من دعم الإشعارات
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    
    if (this.isSupported) {
      try {
        // تسجيل Service Worker
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // انتظار تفعيل Service Worker
        await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        this.isSupported = false;
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async isPermissionGranted(): Promise<boolean> {
    if (!this.isSupported) return false;
    return Notification.permission === 'granted';
  }

  async showNotification(message: ChatMessage, orderId: string): Promise<void> {
    if (!this.isSupported || !this.registration) {
      console.log('Cannot show notification - not supported or not registered');
      return;
    }

    const hasPermission = await this.isPermissionGranted();
    if (!hasPermission) {
      console.log('No notification permission');
      return;
    }

    try {
      const title = this.getNotificationTitle(message);
      const body = this.getNotificationBody(message);
      
      await this.registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: {
          orderId,
          messageId: message.id,
          url: '/'
        },
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200],
        tag: `message-${message.id}` // لتجنب الإشعارات المكررة
      } as any);

      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private getNotificationTitle(message: ChatMessage): string {
    const roleLabels = {
      client: 'عميل',
      designer: 'مصمم', 
      admin: 'إدارة',
      system: 'النظام'
    };
    
    const roleLabel = roleLabels[message.sender_role] || 'مستخدم';
    return `رسالة جديدة من ${roleLabel}`;
  }

  private getNotificationBody(message: ChatMessage): string {
    const maxLength = 100;
    const content = message.content;
    
    if (content.length <= maxLength) {
      return `${message.sender_name}: ${content}`;
    }
    
    return `${message.sender_name}: ${content.substring(0, maxLength)}...`;
  }

  async checkAndRequestPermission(): Promise<boolean> {
    const hasPermission = await this.isPermissionGranted();
    
    if (hasPermission) {
      return true;
    }
    
    // طلب الإذن إذا لم يكن ممنوحاً
    return await this.requestPermission();
  }
}

export const pushNotificationService = new PushNotificationService();
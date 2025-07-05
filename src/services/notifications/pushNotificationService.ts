import { ChatMessage } from '@/types/database';

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = false;
  private subscription: PushSubscription | null = null;
  
  // VAPID keys للـ Web Push (يمكن الحصول عليها من web-push library)
  private readonly vapidPublicKey = 'BMqSvZeUd7F5QzG-7-NjbQk8YpF1KZnNbVXz-8-v_4yKvDT0dERn3BT0zDPxL4R7YjE1F7KzF7FqR1XNR5QzQzG';

  constructor() {
    this.init();
  }

  private async init() {
    // التحقق من دعم الإشعارات
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    
    if (this.isSupported) {
      try {
        // تسجيل Service Worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service Worker registered successfully');
        
        // انتظار تفعيل Service Worker
        await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');
        
        // تفعيل push subscription
        await this.setupPushSubscription();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        this.isSupported = false;
      }
    }
  }

  private async setupPushSubscription() {
    if (!this.registration) return;

    try {
      // التحقق من وجود subscription موجود
      const existingSubscription = await this.registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        this.subscription = existingSubscription;
        console.log('Existing push subscription found');
        return;
      }

      // إنشاء subscription جديد
      const newSubscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.subscription = newSubscription;
      console.log('New push subscription created:', newSubscription);
      
      // هنا يمكن إرسال الـ subscription إلى الخادم لحفظه
      await this.sendSubscriptionToServer(newSubscription);
      
    } catch (error) {
      console.error('Error setting up push subscription:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    // هنا يمكن إرسال الـ subscription إلى الخادم
    // في الوقت الحالي سنحفظه في localStorage كمثال
    localStorage.setItem('pushSubscription', JSON.stringify(subscription));
    console.log('Push subscription saved');
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
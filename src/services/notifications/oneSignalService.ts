import { ChatMessage } from '@/types/database';

declare global {
  interface Window {
    OneSignal: any;
  }
}

class OneSignalService {
  private isInitialized = false;
  private appId = ''; // سيتم تعيينه من إعدادات OneSignal في medein

  constructor() {
    this.init();
  }

  private async init() {
    // التحقق من وجود OneSignal في النافذة العامة
    if (typeof window !== 'undefined' && window.OneSignal) {
      console.log('OneSignal detected, initializing...');
      try {
        await window.OneSignal.init({
          appId: this.appId,
          notifyButton: {
            enable: true,
          },
          welcomeNotification: {
            disable: true
          }
        });
        
        this.isInitialized = true;
        console.log('OneSignal initialized successfully');
      } catch (error) {
        console.error('OneSignal initialization failed:', error);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isInitialized || !window.OneSignal) {
      console.log('OneSignal not available');
      return false;
    }

    try {
      const permission = await window.OneSignal.showNativePrompt();
      console.log('OneSignal permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting OneSignal permission:', error);
      return false;
    }
  }

  async isPermissionGranted(): Promise<boolean> {
    if (!this.isInitialized || !window.OneSignal) {
      return false;
    }

    try {
      const permission = await window.OneSignal.getNotificationPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error checking OneSignal permission:', error);
      return false;
    }
  }

  async showNotification(message: ChatMessage, orderId: string): Promise<void> {
    if (!this.isInitialized || !window.OneSignal) {
      console.log('OneSignal not available for notification');
      return;
    }

    const hasPermission = await this.isPermissionGranted();
    if (!hasPermission) {
      console.log('No OneSignal permission');
      return;
    }

    try {
      // إرسال إشعار محلي باستخدام OneSignal
      await window.OneSignal.showSlidedownPrompt({
        force: true,
        text: {
          'actionMessage': `رسالة جديدة من ${message.sender_name}`,
          'acceptButton': 'السماح',
          'cancelButton': 'لا شكراً'
        }
      });

      console.log('OneSignal notification sent successfully');
    } catch (error) {
      console.error('Error showing OneSignal notification:', error);
    }
  }

  async getUserId(): Promise<string | null> {
    if (!this.isInitialized || !window.OneSignal) {
      return null;
    }

    try {
      const userId = await window.OneSignal.getUserId();
      return userId;
    } catch (error) {
      console.error('Error getting OneSignal user ID:', error);
      return null;
    }
  }

  // تسجيل المستخدم مع بيانات إضافية
  async setUserData(userData: { name?: string; role?: string; userId?: string }) {
    if (!this.isInitialized || !window.OneSignal) {
      return;
    }

    try {
      await window.OneSignal.sendTags({
        name: userData.name,
        role: userData.role,
        user_id: userData.userId
      });
      
      console.log('OneSignal user data set successfully');
    } catch (error) {
      console.error('Error setting OneSignal user data:', error);
    }
  }
}

export const oneSignalService = new OneSignalService();
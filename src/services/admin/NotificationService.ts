import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'deadline';
  related_order_id?: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: any;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export class NotificationService {
  // إرسال إشعار جديد
  static async sendNotification(notificationData: {
    user_id: string;
    title: string;
    message: string;
    type: Notification['type'];
    priority?: Notification['priority'];
    related_order_id?: string;
    action_url?: string;
    scheduled_for?: string;
  }): Promise<{ success: boolean; notification?: Notification; error?: string }> {
    try {
      console.log('Sending notification:', notificationData);

      // التحقق من إعدادات المستخدم
      const userSettings = await this.getUserNotificationSettings(notificationData.user_id);
      
      if (!userSettings || !userSettings.notification_types[notificationData.type]) {
        console.log('User has disabled this notification type');
        return { success: true }; // لا نرسل الإشعار لكن لا نعتبرها خطأ
      }

      // التحقق من ساعات الهدوء
      if (this.isQuietHours(userSettings)) {
        console.log('User is in quiet hours, scheduling notification');
        notificationData.scheduled_for = this.getNextAvailableTime(userSettings);
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          priority: notificationData.priority || 'medium',
          sent_at: notificationData.scheduled_for ? null : new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
      }

      // إرسال إشعار فوري إذا لم يكن مؤجل
      if (!notificationData.scheduled_for) {
        await this.sendRealtimeNotification(data as Notification);
        
        // إرسال إشعار بالبريد الإلكتروني إذا كان مفعل
        if (userSettings.email_notifications) {
          await this.sendEmailNotification(data as Notification);
        }
      }

      return { success: true, notification: data as Notification };
    } catch (error) {
      console.error('Unexpected error sending notification:', error);
      return { success: false, error: 'حدث خطأ في إرسال الإشعار' };
    }
  }

  // الحصول على إشعارات المستخدم
  static async getUserNotifications(
    userId: string, 
    unreadOnly: boolean = false,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data as Notification[];
    } catch (error) {
      console.error('Unexpected error fetching notifications:', error);
      return [];
    }
  }

  // تحديد الإشعار كمقروء
  static async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error marking notification as read:', error);
      return { success: false, error: 'حدث خطأ في تحديث الإشعار' };
    }
  }

  // تحديد جميع الإشعارات كمقروءة
  static async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error marking all notifications as read:', error);
      return { success: false, error: 'حدث خطأ في تحديث الإشعارات' };
    }
  }

  // الحصول على إعدادات الإشعارات للمستخدم
  static async getUserNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching notification settings:', error);
        return null;
      }

      // إنشاء إعدادات افتراضية إذا لم توجد
      if (!data) {
        const defaultSettings = {
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          notification_types: {
            task: true,
            deadline: true,
            order_update: true,
            chat: true
          },
          timezone: 'UTC'
        };

        const { data: newSettings, error: createError } = await supabase
          .from('notification_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          console.error('Error creating default notification settings:', createError);
          return null;
        }

        return newSettings as NotificationSettings;
      }

      return data as NotificationSettings;
    } catch (error) {
      console.error('Unexpected error fetching notification settings:', error);
      return null;
    }
  }

  // تحديث إعدادات الإشعارات
  static async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating notification settings:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating notification settings:', error);
      return { success: false, error: 'حدث خطأ في تحديث إعدادات الإشعارات' };
    }
  }

  // إرسال إشعارات تحديث الطلب
  static async notifyOrderUpdate(
    orderId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Promise<void> {
    try {
      // الحصول على معلومات الطلب
      const { data: order } = await supabase
        .from('design_orders')
        .select('client_id, client_name, design_type')
        .eq('id', orderId)
        .single();

      if (!order) return;

      // إرسال إشعار للعميل
      await this.sendNotification({
        user_id: order.client_id,
        title,
        message,
        type,
        related_order_id: orderId,
        action_url: `/orders/${orderId}`
      });

      // إرسال إشعار للإدارة
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (admins) {
        for (const admin of admins) {
          await this.sendNotification({
            user_id: admin.id,
            title: `تحديث طلب: ${order.client_name}`,
            message: `${title} - ${order.design_type}`,
            type,
            related_order_id: orderId,
            action_url: `/admin/orders/${orderId}`
          });
        }
      }
    } catch (error) {
      console.error('Error sending order update notification:', error);
    }
  }

  // إرسال إشعارات المواعيد النهائية للطلبات
  static async notifyDeadlines(): Promise<void> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // البحث عن الطلبات القريبة من الانتهاء
      const { data: orders } = await supabase
        .from('design_orders')
        .select('*')
        .not('estimated_delivery', 'is', null)
        .lte('estimated_delivery', tomorrow.toISOString())
        .in('status', ['pending', 'in_progress']);

      if (!orders) return;

      for (const order of orders) {
        const isOverdue = new Date(order.estimated_delivery) < new Date();
        const title = isOverdue ? 'طلب متأخر!' : 'موعد تسليم قريب';
        const message = `الطلب: ${order.design_type} - العميل: ${order.client_name}`;

        // إرسال إشعار للعميل
        await this.sendNotification({
          user_id: order.client_id,
          title,
          message,
          type: 'deadline',
          priority: isOverdue ? 'critical' : 'high',
          related_order_id: order.id,
          action_url: `/orders/${order.id}`
        });

        // إرسال إشعار للمصمم المخصص إذا كان هناك واحد
        if (order.assigned_designer_id) {
          const { data: designer } = await supabase
            .from('designers')
            .select('user_id')
            .eq('id', order.assigned_designer_id)
            .single();

          if (designer) {
            await this.sendNotification({
              user_id: designer.user_id,
              title,
              message,
              type: 'deadline',
              priority: isOverdue ? 'critical' : 'high',
              related_order_id: order.id,
              action_url: `/orders/${order.id}`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending deadline notifications:', error);
    }
  }

  // إرسال إشعار فوري عبر Realtime
  private static async sendRealtimeNotification(notification: Notification): Promise<void> {
    try {
      const channel = supabase.channel(`notifications_${notification.user_id}`);
      channel.send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      });
    } catch (error) {
      console.error('Error sending realtime notification:', error);
    }
  }

  // إرسال إشعار بالبريد الإلكتروني
  private static async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      // هنا يمكن إضافة تكامل مع خدمة البريد الإلكتروني
      console.log('Email notification would be sent:', notification);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // التحقق من ساعات الهدوء
  private static isQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quiet_hours_start || !settings.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5);
    
    return currentTime >= settings.quiet_hours_start && currentTime <= settings.quiet_hours_end;
  }

  // الحصول على الوقت التالي المتاح
  private static getNextAvailableTime(settings: NotificationSettings): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (settings.quiet_hours_end) {
      const [hours, minutes] = settings.quiet_hours_end.split(':');
      tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    return tomorrow.toISOString();
  }

  // الاشتراك في الإشعارات الفورية
  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void {
    const channel = supabase.channel(`notifications_${userId}`);
    
    channel
      .on('broadcast', { event: 'new_notification' }, ({ payload }) => {
        callback(payload as Notification);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const notificationService = new NotificationService();
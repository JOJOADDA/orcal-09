import { memo, useMemo } from 'react';
import { DesignOrder, Profile } from '@/types/database';
import { unifiedChatService } from '@/services/unifiedChatService';
import { realTimeSyncService } from '@/services/realTimeSync';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { useToast } from '@/hooks/use-toast';

interface OptimizedSubscriptionsProps {
  user: Profile;
  orders: DesignOrder[];
  onOrderUpdate?: (order: DesignOrder) => void;
  onNewMessage?: (message: any, orderId: string) => void;
}

// مكون محسن للاشتراكات مع منع إعادة التشغيل غير الضروري
const OptimizedSubscriptions = memo(({ 
  user, 
  orders, 
  onOrderUpdate, 
  onNewMessage 
}: OptimizedSubscriptionsProps) => {
  const { showNotification } = useNotifications();
  const { toast } = useToast();

  // حفظ معرفات الطلبات لتجنب إعادة إنشاء الاشتراكات
  const orderIds = useMemo(() => orders.map(order => order.id), [orders]);

  useMemo(() => {
    console.log('=== Setting up optimized subscriptions ===');
    
    // الاشتراك في تحديثات الطلبات (مرة واحدة فقط)
    const unsubscribeOrders = realTimeSyncService.subscribeToOrderUpdates((updatedOrder) => {
      console.log('Order update received:', updatedOrder.id);
      onOrderUpdate?.(updatedOrder);
      
      // إشعارات محسنة للتحديثات
      if (updatedOrder.client_id === user.id) {
        const statusMessages = {
          'in-progress': 'بدأ المصمم في تنفيذ طلبك',
          'completed': 'تم إكمال تصميمك',
          'delivered': 'تم تسليم التصميم'
        };
        
        const message = statusMessages[updatedOrder.status as keyof typeof statusMessages];
        if (message) {
          toast({ title: "تحديث الطلب", description: message });
        }
      }
    });

    // اشتراك محسن للرسائل (مع تجميع الطلبات)
    const messageUnsubscribers: (() => void)[] = [];
    
    orders.forEach(order => {
      const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (message) => {
        if (message.sender_id !== user.id) {
          onNewMessage?.(message, order.id);
          
          showNotification(message, () => {
            console.log('Opening chat for order:', order.id);
          }, order.id);
        }
      });
      
      if (unsubscribe) {
        messageUnsubscribers.push(unsubscribe);
      }
    });

    // تنظيف الاشتراكات عند تغيير المعرفات
    return () => {
      console.log('Cleaning up optimized subscriptions');
      unsubscribeOrders?.();
      messageUnsubscribers.forEach(unsub => unsub());
    };
  }, [orderIds.join(','), user.id]); // استخدام join لمقارنة أفضل

  return null;
});

OptimizedSubscriptions.displayName = 'OptimizedSubscriptions';

export default OptimizedSubscriptions;
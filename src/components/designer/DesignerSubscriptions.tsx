
import { useEffect } from 'react';
import { DesignOrder } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { realTimeSyncService } from '@/services/realTimeSync';
import { unifiedChatService } from '@/services/unifiedChatService';

interface DesignerSubscriptionsProps {
  designerProfile: any;
  orders: DesignOrder[];
  onOrderUpdate: (order: DesignOrder) => void;
}

const DesignerSubscriptions = ({ designerProfile, orders, onOrderUpdate }: DesignerSubscriptionsProps) => {
  const { toast } = useToast();
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (!designerProfile) return;

    console.log('=== Setting up designer subscriptions ===');
    console.log('Designer profile:', designerProfile);
    
    // الاشتراك في التحديثات الفورية للطلبات
    const unsubscribeOrders = realTimeSyncService.subscribeToOrderUpdates((updatedOrder) => {
      console.log('Designer received order update:', updatedOrder);
      onOrderUpdate(updatedOrder);
    });

    // الاشتراك في الرسائل الجديدة من العملاء باستخدام unifiedChatService
    const messageSubscriptions: (() => void)[] = [];
    
    orders.forEach(order => {
      const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (message) => {
        console.log('Designer received new message:', message);
        // إشعار المصمم بالرسائل الجديدة من العملاء فقط
        if (message.sender_role === 'client' && message.sender_id !== designerProfile.id) {
          // WhatsApp-style notification
          showNotification(message, () => {
            // يمكن إضافة منطق لفتح الدردشة هنا
            console.log('Opening chat for order:', order.id);
          });
          
          // Keep toast as backup
          toast({
            title: "رسالة جديدة من العميل",
            description: `رسالة في طلب: ${order.design_type}`,
            duration: 5000
          });
        }
      });
      
      if (unsubscribe) {
        messageSubscriptions.push(unsubscribe);
      }
    });

    return () => {
      console.log('Cleaning up designer subscriptions');
      if (unsubscribeOrders) unsubscribeOrders();
      messageSubscriptions.forEach(unsub => unsub());
    };
  }, [designerProfile, orders.length, onOrderUpdate, toast]);

  return null;
};

export default DesignerSubscriptions;

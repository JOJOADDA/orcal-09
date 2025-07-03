
import { useState, useEffect } from 'react';
import { DesignOrder, Profile } from '@/types/database';
import CreateOrderDialog from './CreateOrderDialog';
import EnhancedChatWindow from './chat/EnhancedChatWindow';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { orderService } from '@/services/orders/orderService';
import { realTimeSyncService } from '@/services/realTimeSync';
import { unifiedChatService } from '@/services/unifiedChatService';
import ClientHeader from './client/ClientHeader';
import ClientStats from './client/ClientStats';
import ClientOrdersList from './client/ClientOrdersList';

interface ClientDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const ClientDashboard = ({ user, onLogout }: ClientDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { showNotification } = useNotifications();

  useEffect(() => {
    loadOrders();
    
    // الاشتراك في التحديثات الفورية للطلبات
    const unsubscribeOrders = realTimeSyncService.subscribeToOrderUpdates((updatedOrder) => {
      // تحديث الطلب إذا كان للعميل الحالي
      if (updatedOrder.client_id === user.id) {
        setOrders(prev => {
          const existingIndex = prev.findIndex(order => order.id === updatedOrder.id);
          if (existingIndex >= 0) {
            const newOrders = [...prev];
            newOrders[existingIndex] = updatedOrder;
            return newOrders;
          } else {
            return [updatedOrder, ...prev];
          }
        });

        // إشعار العميل بالتحديث
        if (updatedOrder.status === 'in-progress') {
          toast({
            title: "تحديث الطلب",
            description: "بدأ المصمم في تنفيذ طلبك"
          });
        } else if (updatedOrder.status === 'completed') {
          toast({
            title: "تحديث الطلب",
            description: "تم إكمال تصميمك"
          });
        } else if (updatedOrder.status === 'delivered') {
          toast({
            title: "تحديث الطلب",
            description: "تم تسليم التصميم"
          });
        }
      }
    });

    // الاشتراك في الرسائل الجديدة باستخدام unifiedChatService
    const messageSubscriptions: (() => void)[] = [];
    
    orders.forEach(order => {
      const unsubscribe = unifiedChatService.subscribeToMessages(order.id, (message) => {
        if (message.sender_id !== user.id) {
          // WhatsApp-style notification
          showNotification(message, () => {
            setSelectedOrderId(order.id);
          });
          
          // Keep toast as backup
          toast({
            title: "رسالة جديدة من المصمم",
            description: `رسالة في طلب: ${order.design_type}`
          });
        }
      });
      
      if (unsubscribe) {
        messageSubscriptions.push(unsubscribe);
      }
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      messageSubscriptions.forEach(unsub => unsub());
    };
  }, [user.id, orders.length]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const userOrders = await orderService.getOrdersByClientId(user.id);
      console.log('Loaded client orders:', userOrders.length);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلبات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderCreated = () => {
    setIsCreateOrderOpen(false);
    loadOrders();
    toast({
      title: "تم إنشاء الطلب",
      description: "تم إنشاء طلب التصميم بنجاح"
    });
  };

  const handleCreateOrder = () => {
    setIsCreateOrderOpen(true);
  };

  const handleOpenChat = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  if (selectedOrderId) {
    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    if (selectedOrder) {
      return (
        <EnhancedChatWindow
          user={user}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <ClientHeader
          user={user}
          onCreateOrder={handleCreateOrder}
          onLogout={onLogout}
        />

        <ClientStats orders={orders} />

        <ClientOrdersList
          orders={orders}
          isLoading={isLoading}
          onCreateOrder={handleCreateOrder}
          onOpenChat={handleOpenChat}
        />
      </div>

      {isCreateOrderOpen && (
        <CreateOrderDialog
          user={user}
          onClose={() => setIsCreateOrderOpen(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default ClientDashboard;


import { useState, useEffect, useMemo, useCallback } from 'react';
import { DesignOrder, Profile } from '@/types/database';
import CreateOrderDialog from './CreateOrderDialog';
import UnifiedChatWindow from './chat/UnifiedChatWindow';
import OptimizedSubscriptions from './OptimizedSubscriptions';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/orders/orderService';
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

  // تحسين loadOrders مع useCallback
  const loadOrders = useCallback(async () => {
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
  }, [user.id, toast]);

  // تحميل الطلبات عند بداية التشغيل
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // تحسين معالج تحديث الطلبات
  const handleOrderUpdate = useCallback((updatedOrder: DesignOrder) => {
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
    }
  }, [user.id]);

  // تحسين معالج الرسائل الجديدة
  const handleNewMessage = useCallback((message: any, orderId: string) => {
    setSelectedOrderId(orderId);
    toast({
      title: "رسالة جديدة من المصمم",
      description: `رسالة في طلب: ${orders.find(o => o.id === orderId)?.design_type || 'غير محدد'}`
    });
  }, [orders, toast]);

  const handleOrderCreated = useCallback(() => {
    setIsCreateOrderOpen(false);
    loadOrders();
    toast({
      title: "تم إنشاء الطلب",
      description: "تم إنشاء طلب التصميم بنجاح"
    });
  }, [loadOrders, toast]);

  const handleCreateOrder = useCallback(() => {
    setIsCreateOrderOpen(true);
  }, []);

  const handleOpenChat = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
  }, []);

  // تحسين حساب selectedOrder مع useMemo
  const selectedOrder = useMemo(() => 
    selectedOrderId ? orders.find(order => order.id === selectedOrderId) : null, 
    [selectedOrderId, orders]
  );
  if (selectedOrder) {
    return (
      <UnifiedChatWindow
        user={user}
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <OptimizedSubscriptions
        user={user}
        orders={orders}
        onOrderUpdate={handleOrderUpdate}
        onNewMessage={handleNewMessage}
      />
      
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

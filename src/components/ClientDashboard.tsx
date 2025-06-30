import { useState, useEffect } from 'react';
import { Profile } from '@/types/database';
import CreateOrderDialog from './CreateOrderDialog';
import UnifiedChatWindow from './chat/UnifiedChatWindow';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import ClientHeader from './client/ClientHeader';
import ClientStats from './client/ClientStats';
import ClientOrdersList from './client/ClientOrdersList';

interface ClientDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const ClientDashboard = ({ user, onLogout }: ClientDashboardProps) => {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  // Use real-time orders hook
  const { orders, isLoading, error, refetch } = useRealtimeOrders({
    user,
    subscriptionId: `client-${user.id}`
  });

  // Show error if exists
  useEffect(() => {
    if (error) {
      console.error('Orders loading error:', error);
      toast({
        title: "خطأ",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleOrderCreated = () => {
    setIsCreateOrderOpen(false);
    refetch(); // Refresh orders after creating new one
    toast({
      title: "تم إنشاء الطلب",
      description: "تم إنشاء طلب التصميم بنجاح وسيصل للمصممين فوراً"
    });
  };

  const handleCreateOrder = () => {
    setIsCreateOrderOpen(true);
  };

  const handleOpenChat = (orderId: string) => {
    console.log('Opening chat for order:', orderId);
    console.log('User info:', { id: user.id, name: user.name, role: user.role });
    
    const selectedOrder = orders.find(order => order.id === orderId);
    if (!selectedOrder) {
      console.error('Order not found:', orderId);
      toast({
        title: "خطأ",
        description: "لم يتم العثور على الطلب",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Selected order:', selectedOrder);
    setSelectedOrderId(orderId);
  };

  if (selectedOrderId) {
    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    if (selectedOrder) {
      console.log('Rendering UnifiedChatWindow with:', {
        user: { id: user.id, name: user.name, role: user.role },
        order: { id: selectedOrder.id, design_type: selectedOrder.design_type }
      });
      
      return (
        <UnifiedChatWindow
          user={user}
          order={selectedOrder}
          onClose={() => {
            console.log('Closing chat window');
            setSelectedOrderId(null);
          }}
        />
      );
    } else {
      console.error('Selected order not found, closing chat');
      setSelectedOrderId(null);
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

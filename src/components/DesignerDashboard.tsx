
import { useState, useEffect } from 'react';
import { DesignOrder } from '@/types/database';
import EnhancedChatWindow from './chat/EnhancedChatWindow';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/orders/orderService';
import DesignerHeader from './designer/DesignerHeader';
import DesignerStats from './designer/DesignerStats';
import OrdersList from './designer/OrdersList';
import DesignerProfileInit from './designer/DesignerProfileInit';
import DesignerSubscriptions from './designer/DesignerSubscriptions';
import DesignerOrderManager from './designer/DesignerOrderManager';

interface DesignerDashboardProps {
  designerData: { name: string; role: string };
  onLogout: () => void;
}

const DesignerDashboard = ({ designerData, onLogout }: DesignerDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [designerProfile, setDesignerProfile] = useState<any>(null);
  const { toast } = useToast();

  const orderManager = DesignerOrderManager({ 
    designerProfile, 
    onOrdersUpdate: setOrders 
  });

  useEffect(() => {
    if (!designerProfile) return;

    console.log('=== Loading orders for designer ===');
    loadOrders();
  }, [designerProfile]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      console.log('Loading orders for designer dashboard');
      const allOrders = await orderService.getAllOrders();
      console.log('Loaded orders:', allOrders.length);
      console.log('Sample orders:', allOrders.slice(0, 2));
      setOrders(allOrders);
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

  const handleOrderUpdate = (updatedOrder: DesignOrder) => {
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
  };

  // عرض مكون التهيئة إذا لم يتم تهيئة ملف المصمم
  if (!designerProfile) {
    return (
      <DesignerProfileInit
        designerName={designerData.name}
        onProfileInitialized={setDesignerProfile}
      />
    );
  }

  // عرض نافذة الدردشة إذا تم اختيار طلب
  if (selectedOrderId) {
    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    if (selectedOrder) {
      console.log('=== Opening chat window ===');
      console.log('Designer profile for chat:', designerProfile);
      console.log('Selected order:', selectedOrder);
      
      return (
        <EnhancedChatWindow
          user={designerProfile}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <DesignerSubscriptions
        designerProfile={designerProfile}
        orders={orders}
        onOrderUpdate={handleOrderUpdate}
      />
      
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <DesignerHeader 
          designerName={designerData.name}
          onLogout={onLogout}
        />
        
        <DesignerStats orders={orders} />
        
        <OrdersList 
          orders={orders}
          isLoading={isLoading}
          onOpenChat={setSelectedOrderId}
          onUpdateStatus={orderManager.updateOrderStatus}
        />
      </div>
    </div>
  );
};

export default DesignerDashboard;

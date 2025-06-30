
import { useState, useEffect } from 'react';
import { DesignOrder } from '@/types/database';
import ChatWindow from './chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { unifiedChatService } from '@/services/unifiedChatService';
import { orderService } from '@/services/orders/orderService';
import DesignerHeader from './designer/DesignerHeader';
import DesignerStats from './designer/DesignerStats';
import OrdersList from './designer/OrdersList';

interface DesignerDashboardProps {
  designerData: { name: string; role: string };
  onLogout: () => void;
}

const DesignerDashboard = ({ designerData, onLogout }: DesignerDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // إنشاء ملف تعريف مؤقت للمصمم
  const designerProfile = {
    id: `designer-${designerData.name.replace(/\s+/g, '-')}`,
    name: designerData.name,
    phone: '+249123456789',
    role: 'designer' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await orderService.getAllOrders();
      console.log('Loaded orders:', allOrders.length);
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

  const updateOrderStatus = async (orderId: string, status: DesignOrder['status']) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, status);
      if (result.error) {
        throw result.error;
      }

      // إرسال رسالة نظام للعميل
      const getStatusText = (status: DesignOrder['status']) => {
        const statusMap = {
          'pending': 'قيد الانتظار',
          'in-progress': 'جاري التنفيذ',
          'completed': 'مكتمل',
          'delivered': 'تم التسليم'
        };
        return statusMap[status];
      };

      await unifiedChatService.sendMessage({
        order_id: orderId,
        sender_id: 'system',
        sender_name: 'النظام',
        sender_role: 'system',
        content: `تم تحديث حالة الطلب إلى: ${getStatusText(status)}`,
        message_type: 'system'
      });

      await loadOrders();
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح"
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive"
      });
    }
  };

  if (selectedOrderId) {
    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    if (selectedOrder) {
      return (
        <ChatWindow
          user={designerProfile}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
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
          onUpdateStatus={updateOrderStatus}
        />
      </div>
    </div>
  );
};

export default DesignerDashboard;

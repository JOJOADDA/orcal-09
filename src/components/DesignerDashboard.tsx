
import { useState, useEffect } from 'react';
import { DesignOrder } from '@/types/database';
import ChatWindow from './chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { unifiedChatService } from '@/services/unifiedChatService';
import { orderService } from '@/services/orders/orderService';
import { realTimeSyncService } from '@/services/realTimeSync';
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

  // إنشاء معرف UUID صحيح للمصمم
  const generateDesignerUUID = (name: string): string => {
    // إنشاء معرف ثابت ومتسق للمصمم بناءً على الاسم
    const nameHash = btoa(encodeURIComponent(name)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    return `00000000-0000-4000-8000-${nameHash.padEnd(12, '0')}`;
  };

  // إنشاء ملف تعريف للمصمم مع معرف UUID صحيح
  const designerProfile = {
    id: generateDesignerUUID(designerData.name),
    name: designerData.name,
    phone: '+249123456789',
    role: 'designer' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  useEffect(() => {
    loadOrders();
    
    // الاشتراك في التحديثات الفورية للطلبات
    const unsubscribeOrders = realTimeSyncService.subscribeToOrderUpdates((updatedOrder) => {
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

      console.log('Designer received order update:', updatedOrder);
    });

    // الاشتراك في الرسائل الجديدة من العملاء
    const unsubscribeMessages = realTimeSyncService.subscribeToAllMessages((message) => {
      // إشعار المصمم بالرسائل الجديدة من العملاء
      if (message.sender_role === 'client') {
        const orderForMessage = orders.find(order => order.id === message.order_id);
        if (orderForMessage) {
          toast({
            title: "رسالة جديدة من العميل",
            description: `رسالة في طلب: ${orderForMessage.design_type}`
          });
        }
      }
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [orders]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await orderService.getAllOrders();
      console.log('Loaded orders for designer:', allOrders.length);
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

      const getStatusText = (status: DesignOrder['status']) => {
        const statusMap = {
          'pending': 'قيد الانتظار',
          'in-progress': 'جاري التنفيذ',
          'completed': 'مكتمل',
          'delivered': 'تم التسليم'
        };
        return statusMap[status];
      };

      // إرسال إشعار للعميل من المصمم
      console.log('Sending status update message with designer profile:', designerProfile);
      const messageResult = await unifiedChatService.sendMessage({
        order_id: orderId,
        sender_id: designerProfile.id,
        sender_name: designerProfile.name,
        sender_role: 'designer',
        content: `تم تحديث حالة الطلب إلى: ${getStatusText(status)}`,
        message_type: 'system'
      });

      if (messageResult.success) {
        console.log('Status update message sent successfully');
      } else {
        console.error('Failed to send status update message:', messageResult.error);
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب وإشعار العميل"
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

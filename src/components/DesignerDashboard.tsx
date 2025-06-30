
import { useState, useEffect } from 'react';
import { DesignOrder } from '@/types/database';
import ChatWindow from './chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { realChatService } from '@/services/chat/realChatService';
import { orderService } from '@/services/orders/orderService';
import { realTimeSyncService } from '@/services/realTimeSync';
import { DesignerProfileService } from '@/services/designers/designerProfileService';
import DesignerHeader from './designer/DesignerHeader';
import DesignerStats from './designer/DesignerStats';
import OrdersList from './designer/OrdersList';

interface DesignerDashboardProps {
  onLogout: () => void;
}

const DesignerDashboard = ({ onLogout }: DesignerDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [designerProfile, setDesignerProfile] = useState<any>(null);
  const [sessionId] = useState(() => DesignerProfileService.createSessionId());
  const { toast } = useToast();

  useEffect(() => {
    const initializeDesignerProfile = async () => {
      try {
        console.log('Initializing unified designer profile');
        
        const profile = await DesignerProfileService.createDesignerProfile();
        // إضافة معرف الجلسة للملف الشخصي
        const profileWithSession = {
          ...profile,
          sessionId: sessionId,
          displayName: `مصمم - ${sessionId.split('-').pop()}`
        };
        
        setDesignerProfile(profileWithSession);
        console.log('Unified designer profile initialized:', profileWithSession);
      } catch (error) {
        console.error('Error initializing designer profile:', error);
        toast({
          title: "خطأ",
          description: "فشل في تهيئة ملف المصمم",
          variant: "destructive"
        });
      }
    };

    initializeDesignerProfile();
  }, [sessionId]);

  useEffect(() => {
    if (!designerProfile) return;

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
      if (message.sender_role === 'client' && message.sender_id !== designerProfile.id) {
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
  }, [designerProfile, orders]);

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
    if (!designerProfile) {
      console.error('Designer profile not initialized');
      return;
    }

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
      const messageResult = await realChatService.sendMessage({
        order_id: orderId,
        sender_id: designerProfile.id,
        sender_name: designerProfile.displayName,
        sender_role: 'admin',
        content: `تم تحديث حالة الطلب إلى: ${getStatusText(status)}`,
        message_type: 'system'
      });

      if (messageResult.success) {
        console.log('Status update message sent successfully');
      } else {
        console.error('Failed to send status update message:', messageResult.error);
      }

      // تحديث القائمة المحلية
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));

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

  if (!designerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تهيئة لوحة التحكم...</p>
        </div>
      </div>
    );
  }

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
          designerName={designerProfile.displayName}
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


import { useState } from 'react';
import { Profile } from '@/types/database';
import UnifiedChatWindow from './chat/UnifiedChatWindow';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { unifiedChatService } from '@/services/unified/unifiedChatService';
import { orderService } from '@/services/orders/orderService';
import DesignerHeader from './designer/DesignerHeader';
import DesignerStats from './designer/DesignerStats';
import OrdersList from './designer/OrdersList';

interface DesignerDashboardProps {
  designerData: Profile;
  onLogout: () => void;
}

const DesignerDashboard = ({ designerData, onLogout }: DesignerDashboardProps) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  // Use real-time orders hook
  const { orders, isLoading, error, refetch } = useRealtimeOrders({
    user: designerData,
    subscriptionId: `designer-${designerData.id}`
  });

  // Show error if exists
  if (error) {
    toast({
      title: "خطأ",
      description: error,
      variant: "destructive"
    });
  }

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'in-progress' | 'completed' | 'delivered') => {
    try {
      const result = await orderService.updateOrderStatus(orderId, status);
      if (result.error) {
        throw result.error;
      }

      // Send system message to client about status update
      const getStatusText = (status: 'pending' | 'in-progress' | 'completed' | 'delivered') => {
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
        sender_id: designerData.id,
        sender_name: designerData.name,
        sender_role: 'admin',
        content: `تم تحديث حالة الطلب إلى: ${getStatusText(status)}`,
        message_type: 'system'
      });

      // Refetch orders to get latest data
      refetch();
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح وإشعار العميل"
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
        <UnifiedChatWindow
          user={designerData}
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

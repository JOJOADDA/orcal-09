
import { useToast } from '@/hooks/use-toast';
import { DesignOrder } from '@/types/database';
import { orderService } from '@/services/orders/orderService';
import { unifiedChatService } from '@/services/unifiedChatService';

interface DesignerOrderManagerProps {
  designerProfile: any;
  onOrdersUpdate: (updateFn: (prev: DesignOrder[]) => DesignOrder[]) => void;
}

const DesignerOrderManager = ({ designerProfile, onOrdersUpdate }: DesignerOrderManagerProps) => {
  const { toast } = useToast();

  const updateOrderStatus = async (orderId: string, status: DesignOrder['status']) => {
    if (!designerProfile) {
      console.error('Designer profile not initialized');
      return;
    }

    try {
      console.log('=== Updating order status ===');
      console.log('Order ID:', orderId, 'New status:', status);
      
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

      // إرسال إشعار للعميل من المصمم باستخدام unifiedChatService
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

      // تحديث القائمة المحلية
      onOrdersUpdate(prev => prev.map(order => 
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

  return { updateOrderStatus };
};

export default DesignerOrderManager;

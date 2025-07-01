
import { useToast } from '@/hooks/use-toast';
import { DesignOrder } from '@/types/database';
import { orderService } from '@/services/orders/orderService';
import { designerMessageService } from '@/services/chat/DesignerMessageService';

interface DesignerOrderManagerProps {
  designerProfile: any;
  onOrdersUpdate: (updateFn: (prev: DesignOrder[]) => DesignOrder[]) => void;
}

const DesignerOrderManager = ({ designerProfile, onOrdersUpdate }: DesignerOrderManagerProps) => {
  const { toast } = useToast();

  const updateOrderStatus = async (orderId: string, status: DesignOrder['status']) => {
    if (!designerProfile) {
      console.error('Designer profile not initialized');
      toast({
        title: "خطأ",
        description: "لم يتم تهيئة ملف المصمم",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('=== Updating order status ===');
      console.log('Order ID:', orderId, 'New status:', status);
      console.log('Designer profile:', designerProfile);
      
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

      // إرسال إشعار للعميل باستخدام خدمة المصمم المحسنة
      console.log('Sending status update message using designer service');
      const messageResult = await designerMessageService.sendDesignerMessage({
        order_id: orderId,
        sender_id: designerProfile.id,
        sender_name: designerProfile.name,
        content: `تم تحديث حالة الطلب إلى: ${getStatusText(status)}`,
        message_type: 'system'
      });

      if (messageResult.success) {
        console.log('Status update message sent successfully');
        toast({
          title: "تم التحديث",
          description: "تم تحديث حالة الطلب وإشعار العميل بنجاح"
        });
      } else {
        console.error('Failed to send status update message:', messageResult.error);
        toast({
          title: "تم التحديث جزئياً",
          description: "تم تحديث حالة الطلب لكن فشل إرسال الإشعار للعميل",
          variant: "destructive"
        });
      }

      // تحديث القائمة المحلية
      onOrdersUpdate(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));

    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب: " + (error as any)?.message || 'خطأ غير معروف',
        variant: "destructive"
      });
    }
  };

  return { updateOrderStatus };
};

export default DesignerOrderManager;

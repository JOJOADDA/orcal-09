
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { DesignOrder } from '@/types/database';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: DesignOrder;
  onOpenChat: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: DesignOrder['status']) => void;
}

const OrderCard = ({ order, onOpenChat, onUpdateStatus }: OrderCardProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white">
      <div className="space-y-3">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {order.design_type}
              </h4>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2 leading-relaxed">
              {order.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
              <span className="whitespace-nowrap truncate">العميل: {order.client_name}</span>
              <span className="whitespace-nowrap">الهاتف: {order.client_phone}</span>
              <span className="whitespace-nowrap">التاريخ: {new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChat(order.id)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm order-1"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            فتح المحادثة
          </Button>
          
          <div className="flex flex-wrap gap-2 order-2">
            {order.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'in-progress')}
                className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                بدء التنفيذ
              </Button>
            )}
            
            {order.status === 'in-progress' && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                إكمال التصميم
              </Button>
            )}
            
            {order.status === 'completed' && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'delivered')}
                className="bg-purple-500 hover:bg-purple-600 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                تم التسليم
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;

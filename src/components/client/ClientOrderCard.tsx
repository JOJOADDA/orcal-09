
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { DesignOrder } from '@/types/database';

interface ClientOrderCardProps {
  order: DesignOrder;
  onOpenChat: (orderId: string) => void;
}

const ClientOrderCard = ({ order, onOpenChat }: ClientOrderCardProps) => {
  const getStatusIcon = (status: DesignOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'delivered':
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: DesignOrder['status']) => {
    const statusMap = {
      'pending': 'قيد الانتظار',
      'in-progress': 'جاري التنفيذ',
      'completed': 'مكتمل',
      'delivered': 'تم التسليم'
    };
    return statusMap[status];
  };

  const getStatusColor = (status: DesignOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 text-xs w-fit`}>
                {getStatusIcon(order.status)}
                <span className="whitespace-nowrap">{getStatusText(order.status)}</span>
              </Badge>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2 leading-relaxed">
              {order.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
              <span className="whitespace-nowrap">
                تاريخ الإنشاء: {new Date(order.created_at).toLocaleDateString('ar-EG')}
              </span>
              {order.updated_at !== order.created_at && (
                <span className="whitespace-nowrap">
                  آخر تحديث: {new Date(order.updated_at).toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChat(order.id)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            فتح المحادثة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientOrderCard;

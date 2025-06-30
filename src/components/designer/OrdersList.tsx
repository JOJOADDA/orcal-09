
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { DesignOrder } from '@/types/database';
import OrderCard from './OrderCard';

interface OrdersListProps {
  orders: DesignOrder[];
  isLoading: boolean;
  onOpenChat: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: DesignOrder['status']) => void;
}

const OrdersList = ({ orders, isLoading, onOpenChat, onUpdateStatus }: OrdersListProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          طلبات التصميم ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-500 mb-2">لا توجد طلبات</h3>
            <p className="text-sm sm:text-base text-gray-400">لم يتم إنشاء أي طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <OrderCard 
                key={order.id}
                order={order}
                onOpenChat={onOpenChat}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersList;

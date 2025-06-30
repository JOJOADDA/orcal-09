
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Plus } from 'lucide-react';
import { DesignOrder } from '@/types/database';
import ClientOrderCard from './ClientOrderCard';

interface ClientOrdersListProps {
  orders: DesignOrder[];
  isLoading: boolean;
  onCreateOrder: () => void;
  onOpenChat: (orderId: string) => void;
}

const ClientOrdersList = ({ orders, isLoading, onCreateOrder, onOpenChat }: ClientOrdersListProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          طلباتي ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm sm:text-base">جاري التحميل...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-500 mb-2">لا توجد طلبات</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4">ابدأ بإنشاء طلب تصميم جديد</p>
            <Button onClick={onCreateOrder} size="sm">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء طلب جديد
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <ClientOrderCard
                key={order.id}
                order={order}
                onOpenChat={onOpenChat}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientOrdersList;

import { memo, useMemo, useCallback } from 'react';
import { DesignOrder } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye, Calendar, DollarSign } from 'lucide-react';
import VirtualScroll from './VirtualScroll';
import { cn } from '@/lib/utils';

interface UltraFastOrdersListProps {
  orders: DesignOrder[];
  onOrderClick?: (order: DesignOrder) => void;
  onChatClick?: (order: DesignOrder) => void;
  userRole?: 'client' | 'admin' | 'designer';
  containerHeight?: number;
}

// مكون عرض طلب محسن للغاية
const OptimizedOrderCard = memo(({ 
  order, 
  onOrderClick, 
  onChatClick,
  userRole = 'client'
}: { 
  order: DesignOrder; 
  onOrderClick?: (order: DesignOrder) => void;
  onChatClick?: (order: DesignOrder) => void;
  userRole?: string;
}) => {
  // تحسين الألوان والحالات
  const statusConfig = useMemo(() => {
    const configs = {
      'pending': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'قيد الانتظار',
        icon: '⏳'
      },
      'in-progress': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'جاري التنفيذ',
        icon: '⚡'
      },
      'completed': { 
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'مكتمل',
        icon: '✅'
      },
      'delivered': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        text: 'تم التسليم',
        icon: '🎉'
      }
    };
    return configs[order.status as keyof typeof configs] || configs.pending;
  }, [order.status]);

  const priorityConfig = useMemo(() => {
    const configs = {
      'low': { color: 'text-gray-500', text: 'منخفضة' },
      'medium': { color: 'text-blue-500', text: 'متوسطة' },
      'high': { color: 'text-red-500', text: 'عالية' }
    };
    return configs[order.priority as keyof typeof configs] || configs.medium;
  }, [order.priority]);

  // معالجات الأحداث محسنة
  const handleOrderClick = useCallback(() => {
    onOrderClick?.(order);
  }, [onOrderClick, order]);

  const handleChatClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick?.(order);
  }, [onChatClick, order]);

  // تنسيق التاريخ بكفاءة
  const formattedDate = useMemo(() => {
    return new Date(order.created_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, [order.created_at]);

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 bg-white"
      onClick={handleOrderClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">
              {order.design_type}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {order.description}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-3">
            <Badge 
              className={cn(
                "text-xs font-medium border",
                statusConfig.color
              )}
            >
              {statusConfig.icon} {statusConfig.text}
            </Badge>
            
            {order.total_price && (
              <div className="flex items-center text-sm font-medium text-green-600">
                <DollarSign className="w-4 h-4 mr-1" />
                {order.total_price.toLocaleString()} ر.س
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {userRole !== 'client' && (
              <span className="flex items-center">
                <span className="font-medium">العميل:</span>
                <span className="mr-1">{order.client_name}</span>
              </span>
            )}
            
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formattedDate}
            </span>
            
            <span className={cn(
              "flex items-center font-medium",
              priorityConfig.color
            )}>
              الأولوية: {priorityConfig.text}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleChatClick}
              className="h-8 w-8 p-0 hover:bg-blue-50"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOrderClick}
              className="h-8 w-8 p-0 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedOrderCard.displayName = 'OptimizedOrderCard';

// مكون القائمة السريع جداً
const UltraFastOrdersList = memo(({ 
  orders, 
  onOrderClick, 
  onChatClick,
  userRole = 'client',
  containerHeight = 600
}: UltraFastOrdersListProps) => {
  // فلترة وترتيب الطلبات بكفاءة
  const processedOrders = useMemo(() => {
    return orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((order, index) => ({ ...order, _index: index }));
  }, [orders]);

  // معالج رسم العنصر محسن
  const renderOrderItem = useCallback((order: DesignOrder, index: number) => (
    <div key={order.id} className="mb-3">
      <OptimizedOrderCard
        order={order}
        onOrderClick={onOrderClick}
        onChatClick={onChatClick}
        userRole={userRole}
      />
    </div>
  ), [onOrderClick, onChatClick, userRole]);

  // عرض رسالة فارغة محسنة
  if (processedOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          لا توجد طلبات
        </h3>
        <p className="text-gray-500">
          لم يتم العثور على أي طلبات تصميم حتى الآن
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          الطلبات ({processedOrders.length})
        </h2>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>مرتبة حسب الأحدث</span>
        </div>
      </div>

      {/* استخدام التمرير الافتراضي للقوائم الطويلة */}
      {processedOrders.length > 10 ? (
        <VirtualScroll
          items={processedOrders}
          itemHeight={140} // ارتفاع بطاقة الطلب
          containerHeight={containerHeight}
          renderItem={renderOrderItem}
          overscan={3}
        />
      ) : (
        <div className="space-y-3">
          {processedOrders.map((order, index) => 
            renderOrderItem(order, index)
          )}
        </div>
      )}
    </div>
  );
});

UltraFastOrdersList.displayName = 'UltraFastOrdersList';

export default UltraFastOrdersList;
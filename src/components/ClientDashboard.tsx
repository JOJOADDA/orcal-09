
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Clock, CheckCircle, Truck, AlertCircle, User, LogOut } from 'lucide-react';
import { Profile, DesignOrder } from '@/types/database';
import CreateOrderDialog from './CreateOrderDialog';
import ChatWindow from './chat/ChatWindow';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/orders/orderService';

interface ClientDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const ClientDashboard = ({ user, onLogout }: ClientDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [user.id]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const userOrders = await orderService.getOrdersByClientId(user.id);
      console.log('Loaded client orders:', userOrders.length);
      setOrders(userOrders);
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

  const handleOrderCreated = () => {
    setIsCreateOrderOpen(false);
    loadOrders();
    toast({
      title: "تم إنشاء الطلب",
      description: "تم إنشاء طلب التصميم بنجاح"
    });
  };

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

  if (selectedOrderId) {
    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    if (selectedOrder) {
      return (
        <ChatWindow
          user={user}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <img 
                src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
                alt="أوركال" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  مرحباً {user.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">لوحة تحكم العميل</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setIsCreateOrderOpen(true)}
                className="text-sm sm:text-base"
                size="sm"
              >
                <Plus className="w-4 h-4 ml-2" />
                طلب جديد
              </Button>
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="text-sm sm:text-base"
                size="sm"
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>

        {/* Stats - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'إجمالي الطلبات', value: orders.length, color: 'from-blue-500 to-cyan-500' },
            { label: 'قيد الانتظار', value: orders.filter(o => o.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
            { label: 'جاري التنفيذ', value: orders.filter(o => o.status === 'in-progress').length, color: 'from-purple-500 to-pink-500' },
            { label: 'مكتملة', value: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length, color: 'from-green-500 to-emerald-500' }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-2 sm:mb-3`}>
                  <span className="text-lg sm:text-xl font-bold text-white">{stat.value}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">
                  {stat.label}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders List - Mobile Optimized */}
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
                <Button onClick={() => setIsCreateOrderOpen(true)} size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء طلب جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white"
                  >
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
                          onClick={() => setSelectedOrderId(order.id)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm"
                        >
                          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                          فتح المحادثة
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isCreateOrderOpen && (
        <CreateOrderDialog
          user={user}
          onClose={() => setIsCreateOrderOpen(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default ClientDashboard;


import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { DesignOrder, Profile } from '@/types/database';
import CreateOrderDialog from './CreateOrderDialog';
import ChatWindow from './ChatWindow';
import DesignerAuthDialog from './DesignerAuthDialog';
import DesignerDashboard from './DesignerDashboard';

interface ClientDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const ClientDashboard = ({ user, onLogout }: ClientDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDesignerAuth, setShowDesignerAuth] = useState(false);
  const [designerData, setDesignerData] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user.id]);

  const loadOrders = async () => {
    setIsLoading(true);
    const userOrders = await supabaseService.getOrdersByClientId(user.id);
    setOrders(userOrders);
    setIsLoading(false);
  };

  const handleOrderCreated = () => {
    loadOrders();
    setShowCreateOrder(false);
  };

  const handleDesignerLogin = (data: { name: string; role: string }) => {
    setDesignerData(data);
    setShowDesignerAuth(false);
  };

  const handleDesignerLogout = () => {
    setDesignerData(null);
  };

  // إذا كان المصمم مسجل دخول، عرض لوحة تحكم المصممين
  if (designerData) {
    return (
      <DesignerDashboard 
        designerData={designerData} 
        onLogout={handleDesignerLogout} 
      />
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
              alt="أوركال" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">مرحباً {user.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">إدارة طلبات التصميم الخاصة بك</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setShowCreateOrder(true)}
              className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 flex-1 sm:flex-none text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 ml-2" />
              طلب جديد
            </Button>
            <Button
              onClick={() => setShowDesignerAuth(true)}
              variant="outline"
              className="text-sm sm:text-base border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              دخول المصممين
            </Button>
            <Button variant="outline" onClick={onLogout} className="text-sm sm:text-base">
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Stats - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">{stat.label}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              طلباتك
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {isLoading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm sm:text-base">جاري التحميل...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-500 mb-2">لا توجد طلبات بعد</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">ابدأ بإنشاء طلب تصميم جديد</p>
                <Button
                  onClick={() => setShowCreateOrder(true)}
                  className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء طلب جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">{order.design_type}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{order.description}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 text-xs whitespace-nowrap ml-2`}>
                        {getStatusIcon(order.status)}
                        <span className="hidden sm:inline">{getStatusText(order.status)}</span>
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
                      <span>تاريخ الإنشاء: {new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm p-1 sm:p-2">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        <span className="hidden sm:inline">فتح المحادثة</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {showCreateOrder && (
        <CreateOrderDialog
          user={user}
          onClose={() => setShowCreateOrder(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {showDesignerAuth && (
        <DesignerAuthDialog
          onClose={() => setShowDesignerAuth(false)}
          onDesignerLogin={handleDesignerLogin}
        />
      )}
    </div>
  );
};

export default ClientDashboard;

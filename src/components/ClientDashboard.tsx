import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { DesignOrder, User } from '@/types/chat';
import CreateOrderDialog from './CreateOrderDialog';
import ChatWindow from './ChatWindow';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

const ClientDashboard = ({ user, onLogout }: ClientDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user.id]);

  const loadOrders = () => {
    const userOrders = chatService.getOrdersByClientId(user.id);
    setOrders(userOrders);
  };

  const handleOrderCreated = () => {
    loadOrders();
    setShowCreateOrder(false);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" 
              alt="أوركال" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مرحباً {user.name}</h1>
              <p className="text-gray-600">إدارة طلبات التصميم الخاصة بك</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateOrder(true)}
              className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              طلب جديد
            </Button>
            <Button variant="outline" onClick={onLogout}>
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الطلبات', value: orders.length, color: 'from-blue-500 to-cyan-500' },
            { label: 'قيد الانتظار', value: orders.filter(o => o.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
            { label: 'جاري التنفيذ', value: orders.filter(o => o.status === 'in-progress').length, color: 'from-purple-500 to-pink-500' },
            { label: 'مكتملة', value: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length, color: 'from-green-500 to-emerald-500' }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4`}>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{stat.label}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              طلباتك
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد طلبات بعد</h3>
                <p className="text-gray-400 mb-6">ابدأ بإنشاء طلب تصميم جديد</p>
                <Button
                  onClick={() => setShowCreateOrder(true)}
                  className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء طلب جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{order.designType}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{order.description}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>تاريخ الإنشاء: {new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 ml-1" />
                        فتح المحادثة
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Order Dialog */}
      {showCreateOrder && (
        <CreateOrderDialog
          user={user}
          onClose={() => setShowCreateOrder(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default ClientDashboard;

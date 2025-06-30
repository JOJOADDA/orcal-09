
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, CheckCircle, Truck, AlertCircle, User, LogOut } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { DesignOrder } from '@/types/database';
import ChatWindow from './ChatWindow';
import { useToast } from '@/hooks/use-toast';

interface DesignerDashboardProps {
  designerData: { name: string; role: string };
  onLogout: () => void;
}

const DesignerDashboard = ({ designerData, onLogout }: DesignerDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // إنشاء ملف تعريف مؤقت للمصمم
  const designerProfile = {
    id: `designer-${designerData.name.replace(/\s+/g, '-')}`,
    name: designerData.name,
    phone: '+249123456789',
    role: 'admin' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await supabaseService.getAllOrders();
      setOrders(allOrders);
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

  const updateOrderStatus = async (orderId: string, status: DesignOrder['status']) => {
    try {
      await supabaseService.updateOrderStatus(orderId, status);
      await loadOrders();
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح"
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
          user={designerProfile}
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
              alt="أوركال" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المصممين</h1>
              <p className="text-gray-600">مرحباً {designerData.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الطلبات', value: orders.length, color: 'from-blue-500 to-cyan-500' },
            { label: 'قيد الانتظار', value: orders.filter(o => o.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
            { label: 'جاري التنفيذ', value: orders.filter(o => o.status === 'in-progress').length, color: 'from-purple-500 to-pink-500' },
            { label: 'مكتملة', value: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length, color: 'from-green-500 to-emerald-500' }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <span className="text-xl font-bold text-white">{stat.value}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{stat.label}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              طلبات التصميم
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-500">جاري التحميل...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-400">لم يتم إنشاء أي طلبات بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{order.design_type}</h4>
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{order.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>العميل: {order.client_name}</span>
                          <span>الهاتف: {order.client_phone}</span>
                          <span>التاريخ: {new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <MessageSquare className="w-4 h-4 ml-1" />
                        فتح المحادثة
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'in-progress')}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          بدء التنفيذ
                        </Button>
                      )}
                      
                      {order.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          إكمال التصميم
                        </Button>
                      )}
                      
                      {order.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          تم التسليم
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignerDashboard;

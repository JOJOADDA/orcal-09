
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  MessageSquare, 
  Search,
  Filter,
  Settings
} from 'lucide-react';
import { chatService } from '@/services/chatService';
import { DesignOrder, User, ChatRoom } from '@/types/chat';
import ChatWindow from './ChatWindow';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [orders, setOrders] = useState<DesignOrder[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    activeClients: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allOrders = chatService.getAllOrders();
    const allChatRooms = chatService.getAllChatRooms();
    const statistics = chatService.getStatistics();
    
    setOrders(allOrders);
    setChatRooms(allChatRooms);
    setStats(statistics);
  };

  const handleStatusChange = (orderId: string, newStatus: DesignOrder['status']) => {
    chatService.updateOrderStatus(orderId, newStatus);
    loadData();
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.designType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" 
              alt="أوركال" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة إدارة أوركال</h1>
              <p className="text-gray-600">إدارة الطلبات والعملاء</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </Button>
            <Button variant="outline" onClick={onLogout}>
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'إجمالي الطلبات', value: stats.totalOrders, color: 'from-blue-500 to-cyan-500', icon: FileText },
            { label: 'قيد الانتظار', value: stats.pendingOrders, color: 'from-yellow-500 to-orange-500', icon: Clock },
            { label: 'جاري التنفيذ', value: stats.inProgressOrders, color: 'from-purple-500 to-pink-500', icon: AlertCircle },
            { label: 'مكتملة', value: stats.completedOrders, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
            { label: 'العملاء النشطين', value: stats.activeClients, color: 'from-indigo-500 to-purple-500', icon: Users }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="البحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="فلترة حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="in-progress">جاري التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              الطلبات ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-400">لا توجد طلبات تطابق معايير البحث</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{order.designType}</h4>
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{order.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>العميل: {order.clientName}</span>
                          <span>الهاتف: {order.clientPhone}</span>
                          <span>التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => handleStatusChange(order.id, value as DesignOrder['status'])}
                        >
                          <SelectTrigger className="w-40 h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="in-progress">جاري التنفيذ</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="delivered">تم التسليم</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
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
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { DesignOrder } from '@/types/database';
import { OrderManagementService } from '@/services/admin/OrderManagementService';
import { NotificationService } from '@/services/admin/NotificationService';
import { 
  Users, 
  Package, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Timer,
  DollarSign,
  Activity,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react';

interface AdminStats {
  totalOrders: number;
  ordersInProgress: number;
  completedToday: number;
  activeDesigners: number;
  averageCompletionTime: number;
  clientSatisfaction: number;
  revenue: number;
  pendingTasks: number;
}

interface DesignerPerformance {
  designer_id: string;
  name: string;
  orders_completed: number;
  orders_in_progress: number;
  average_completion_time: number;
  satisfaction_score: number;
  capacity: number;
  status: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    ordersInProgress: 0,
    completedToday: 0,
    activeDesigners: 0,
    averageCompletionTime: 0,
    clientSatisfaction: 0,
    revenue: 0,
    pendingTasks: 0
  });
  
  const [designers, setDesigners] = useState<DesignerPerformance[]>([]);
  const [recentOrders, setRecentOrders] = useState<DesignOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    // تحديث البيانات كل 30 ثانية
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadDesigners(),
        loadRecentOrders()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات لوحة التحكم",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    // هنا يمكن إضافة استعلامات للحصول على الإحصائيات الفعلية
    // مؤقتاً سنستخدم بيانات تجريبية
    setStats({
      totalOrders: 156,
      ordersInProgress: 23,
      completedToday: 8,
      activeDesigners: 12,
      averageCompletionTime: 4.5,
      clientSatisfaction: 4.8,
      revenue: 25600,
      pendingTasks: 45
    });
  };

  const loadDesigners = async () => {
    try {
                  const availableDesigners = await OrderManagementService.getAvailableDesigners();
      
      // تحويل البيانات لتتناسب مع الواجهة
      const designerPerformance: DesignerPerformance[] = availableDesigners.map(designer => ({
        designer_id: designer.designer_id,
        name: `مصمم ${designer.designer_id.slice(0, 8)}`,
        orders_completed: Math.floor(Math.random() * 20) + 5,
        orders_in_progress: designer.current_orders_count,
        average_completion_time: Math.random() * 5 + 2,
        satisfaction_score: Math.random() * 1 + 4,
        capacity: designer.current_capacity,
        status: designer.status
      }));
      
      setDesigners(designerPerformance);
    } catch (error) {
      console.error('Error loading designers:', error);
    }
  };

  const loadRecentOrders = async () => {
    // هنا يمكن إضافة استعلام للحصول على الطلبات الحديثة
    // مؤقتاً سنستخدم بيانات تجريبية
    setRecentOrders([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'متاح';
      case 'busy': return 'مشغول';
      case 'away': return 'بعيد';
      case 'offline': return 'غير متصل';
      default: return 'غير معروف';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
            <p className="text-gray-600 mt-1">مراقبة شاملة لجميع العمليات والأداء</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              الإعدادات
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              الإشعارات
            </Button>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs opacity-80">+12% من الشهر الماضي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersInProgress}</div>
              <p className="text-xs opacity-80">متوسط الإنجاز: {stats.averageCompletionTime} أيام</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المصممين النشطين</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDesigners}</div>
              <p className="text-xs opacity-80">معدل الرضا: {stats.clientSatisfaction}/5</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} ر.س</div>
              <p className="text-xs opacity-80">هذا الشهر</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs للتفاصيل */}
        <Tabs defaultValue="designers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="designers">المصممين</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="tasks">المهام</TabsTrigger>
          </TabsList>

          {/* تبويب المصممين */}
          <TabsContent value="designers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  أداء المصممين
                </CardTitle>
                <CardDescription>
                  مراقبة حالة وأداء جميع المصممين في الوقت الفعلي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {designers.map((designer) => (
                    <div key={designer.designer_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(designer.status)}`}></div>
                        <div>
                          <p className="font-medium">{designer.name}</p>
                          <p className="text-sm text-gray-600">{getStatusText(designer.status)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">مكتمل</p>
                          <p className="font-bold text-green-600">{designer.orders_completed}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">قيد التنفيذ</p>
                          <p className="font-bold text-blue-600">{designer.orders_in_progress}</p>
                        </div>
                        
                        <div className="text-center w-24">
                          <p className="text-sm text-gray-600">الحمولة</p>
                          <Progress value={designer.capacity} className="mt-1" />
                          <p className="text-xs text-gray-500">{designer.capacity}%</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">التقييم</p>
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{designer.satisfaction_score.toFixed(1)}</span>
                            <span className="text-yellow-500">⭐</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الطلبات */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    طلبات تحتاج متابعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
                      <p className="font-medium text-red-900">طلب متأخر</p>
                      <p className="text-sm text-red-700">تصميم لوجو - تأخير 2 أيام</p>
                    </div>
                    <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                      <p className="font-medium text-yellow-900">موعد نهائي قريب</p>
                      <p className="text-sm text-yellow-700">تصميم موقع - باقي 1 يوم</p>
                    </div>
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                      <p className="font-medium text-blue-900">في انتظار الموافقة</p>
                      <p className="text-sm text-blue-700">كارت شخصي - منذ 3 ساعات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    إنجازات اليوم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <div>
                        <p className="font-medium text-green-900">تصميم لوجو مكتمل</p>
                        <p className="text-sm text-green-700">العميل: أحمد محمد</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        مسلم
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <div>
                        <p className="font-medium text-green-900">كارت شخصي مكتمل</p>
                        <p className="text-sm text-green-700">العميل: فاطمة أحمد</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        مسلم
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب التحليلات */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  تحليلات الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">سيتم إضافة الرسوم البيانية والتحليلات المفصلة قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب المهام */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  المهام المعلقة ({stats.pendingTasks})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Timer className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">سيتم عرض قائمة المهام المعلقة والمتأخرة هنا</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
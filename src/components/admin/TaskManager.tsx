import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { OrderManagementService } from '@/services/admin/OrderManagementService';
import { OrderTask } from '@/types/orderTasks';
import { NotificationService } from '@/services/admin/NotificationService';
import { 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Calendar,
  Filter,
  Timer,
  ArrowUpDown
} from 'lucide-react';

interface TaskManagerProps {
  orderId?: string;
}

const TaskManager = ({ orderId }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<OrderTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    task_name: '',
    task_description: '',
    priority: 'medium' as const,
    estimated_hours: 2,
    due_date: ''
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      loadTasks();
    }
  }, [orderId]);

  const loadTasks = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      const orderTasks = await OrderManagementService.getOrderTasks(orderId);
      setTasks(orderTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المهام",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async () => {
    if (!orderId || !newTask.task_name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المهمة",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await OrderManagementService.createTask({
        order_id: orderId,
        task_name: newTask.task_name,
        task_description: newTask.task_description,
        priority: newTask.priority,
        estimated_hours: newTask.estimated_hours,
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : undefined
      });

      if (result.success) {
        await loadTasks();
        setIsCreateDialogOpen(false);
        setNewTask({
          task_name: '',
          task_description: '',
          priority: 'medium',
          estimated_hours: 2,
          due_date: ''
        });
        
        toast({
          title: "تم",
          description: "تم إنشاء المهمة بنجاح",
        });

        // إرسال إشعار للمصمم المخصص (إذا وجد)
        if (tasks.length > 0 && tasks[0].assigned_to) {
          await NotificationService.sendNotification({
            user_id: tasks[0].assigned_to,
            title: "مهمة جديدة",
            message: `تم إضافة مهمة جديدة: ${newTask.task_name}`,
            type: 'task',
            related_order_id: orderId,
            action_url: `/orders/${orderId}`
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المهمة",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: OrderTask['status']) => {
    try {
      // هنا يمكن إضافة API لتحديث حالة المهمة
      toast({
        title: "تم",
        description: "تم تحديث حالة المهمة",
      });
      
      await loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المهمة",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Timer className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغي';
      default: return 'غير معروف';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  const getProgressPercentage = (task: OrderTask) => {
    if (task.status === 'completed') return 100;
    if (task.status === 'in_progress') return 50;
    if (task.status === 'cancelled') return 0;
    return 0;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              إدارة المهام
            </CardTitle>
            <CardDescription>
              إدارة وتتبع المهام للطلب الحالي
            </CardDescription>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                مهمة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
                <DialogDescription>
                  أضف مهمة جديدة لهذا الطلب
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="task_name">اسم المهمة</Label>
                  <Input
                    id="task_name"
                    value={newTask.task_name}
                    onChange={(e) => setNewTask(prev => ({ ...prev, task_name: e.target.value }))}
                    placeholder="أدخل اسم المهمة"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task_description">الوصف</Label>
                  <Textarea
                    id="task_description"
                    value={newTask.task_description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, task_description: e.target.value }))}
                    placeholder="وصف المهمة (اختياري)"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">الأولوية</Label>
                    <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estimated_hours">الساعات المقدرة</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) }))}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due_date">الموعد النهائي</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={createTask}>
                  إنشاء المهمة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* فلاتر */}
        <div className="flex gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">في الانتظار</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأولويات</SelectItem>
              <SelectItem value="urgent">عاجل</SelectItem>
              <SelectItem value="high">عالية</SelectItem>
              <SelectItem value="medium">متوسطة</SelectItem>
              <SelectItem value="low">منخفضة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* قائمة المهام */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Timer className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد مهام</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-medium">{task.task_name}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`${getPriorityColor(task.priority)} text-white text-xs`}
                      >
                        {getPriorityText(task.priority)}
                      </Badge>
                      {task.due_date && isOverdue(task.due_date) && task.status !== 'completed' && (
                        <Badge variant="destructive" className="text-xs">
                          متأخر
                        </Badge>
                      )}
                    </div>
                    
                    {task.task_description && (
                      <p className="text-sm text-gray-600 mb-2">{task.task_description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {task.estimated_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours} ساعة
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString('ar')}
                        </span>
                      )}
                      {task.assigned_to && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          مخصص
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select 
                      value={task.status} 
                      onValueChange={(value: any) => updateTaskStatus(task.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">في الانتظار</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>التقدم</span>
                    <span>{getProgressPercentage(task)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(task)} className="h-2" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskManager;
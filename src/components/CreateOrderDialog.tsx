
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, FileText, Palette } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { User } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderDialogProps {
  user: User;
  onClose: () => void;
  onOrderCreated: () => void;
}

const CreateOrderDialog = ({ user, onClose, onOrderCreated }: CreateOrderDialogProps) => {
  const [formData, setFormData] = useState({
    designType: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedBudget: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const designTypes = [
    'تصميم شعار (Logo)',
    'هوية بصرية كاملة',
    'منشورات سوشيال ميديا',
    'تصميم بروشور أو فلاير',
    'تصميم بانر إعلاني',
    'تصميم كارت شخصي',
    'تصميم مطبوعات',
    'تصميم عرض تقديمي',
    'تصميم تغليف منتج',
    'أخرى'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.designType || !formData.description.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const order = chatService.createOrder({
        clientId: user.id,
        clientName: user.name,
        clientPhone: user.phone,
        designType: formData.designType,
        description: formData.description,
        priority: formData.priority
      });

      toast({
        title: "تم إنشاء الطلب بنجاح!",
        description: "سيتم التواصل معك قريباً من فريق التصميم",
      });

      onOrderCreated();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الطلب، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-red-500" />
            إنشاء طلب تصميم جديد
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designType" className="flex items-center gap-2 font-semibold">
                  <Palette className="w-4 h-4 text-red-500" />
                  نوع التصميم المطلوب *
                </Label>
                <select
                  id="designType"
                  name="designType"
                  value={formData.designType}
                  onChange={handleInputChange}
                  className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-red-400"
                  required
                  disabled={isLoading}
                >
                  <option value="">اختر نوع التصميم</option>
                  {designTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="font-semibold">
                  الأولوية
                </Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full h-12 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-red-400"
                  disabled={isLoading}
                >
                  <option value="low">عادية</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عاجلة</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                تفاصيل التصميم المطلوب *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="اكتب هنا تفاصيل التصميم بدقة: الألوان المفضلة، النص المطلوب، الأسلوب، أي ملاحظات خاصة..."
                className="min-h-[120px] resize-none border-2 border-gray-200 focus:border-red-400"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedBudget" className="font-semibold">
                الميزانية المتوقعة (اختياري)
              </Label>
              <Input
                id="estimatedBudget"
                name="estimatedBudget"
                type="text"
                value={formData.estimatedBudget}
                onChange={handleInputChange}
                placeholder="مثال: 100-200 ريال"
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">إرفاق ملفات (اختياري)</p>
              <p className="text-sm text-gray-500">سيتم إضافة إمكانية رفع الملفات قريباً</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-8 h-12"
                disabled={isLoading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrderDialog;

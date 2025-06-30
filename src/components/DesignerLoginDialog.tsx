
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Lock, Eye, EyeOff, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DesignerLoginDialogProps {
  onClose: () => void;
  onDesignerLogin: (designerData: { name: string; role: string }) => void;
}

const DesignerLoginDialog = ({ onClose, onDesignerLogin }: DesignerLoginDialogProps) => {
  const [designerData, setDesignerData] = useState({
    name: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // قائمة المصممين المسموح لهم بالدخول
  const allowedDesigners = [
    { name: 'أحمد محمد', password: 'designer123' },
    { name: 'فاطمة أحمد', password: 'designer456' },
    { name: 'محمد علي', password: 'designer789' },
    { name: 'سارة حسن', password: 'designer321' },
    { name: 'يوسف إبراهيم', password: 'designer654' },
    { name: 'مريم عثمان', password: 'designer987' },
    { name: 'عبدالله حسين', password: 'designer111' },
    { name: 'زينب محجوب', password: 'designer222' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!designerData.name.trim() || !designerData.password.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // محاكاة تأخير للتحقق من البيانات
    setTimeout(() => {
      const designer = allowedDesigners.find(
        d => d.name.toLowerCase() === designerData.name.toLowerCase() && 
             d.password === designerData.password
      );

      if (designer) {
        toast({
          title: "تم تسجيل الدخول بنجاح!",
          description: `مرحباً ${designer.name}، يمكنك الآن إدارة الطلبات`
        });
        onDesignerLogin({ name: designer.name, role: 'designer' });
      } else {
        toast({
          title: "خطأ في البيانات",
          description: "اسم المصمم أو كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-6 h-6 text-orange-500" />
            دخول المصممين
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <img 
              src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
              alt="أوركال" 
              className="w-16 h-16 mx-auto object-contain mb-4"
            />
            <p className="text-gray-600 text-sm">
              مخصص للمصممين لإدارة الطلبات والمشاريع
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="designer-name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                اسم المصمم
              </Label>
              <Input
                id="designer-name"
                type="text"
                value={designerData.name}
                onChange={(e) => setDesignerData({ ...designerData, name: e.target.value })}
                placeholder="أدخل اسمك الكامل"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designer-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="designer-password"
                  type={showPassword ? "text" : "password"}
                  value={designerData.password}
                  onChange={(e) => setDesignerData({ ...designerData, password: e.target.value })}
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isLoading ? 'جاري التحقق...' : 'دخول'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">بيانات تجريبية للاختبار:</h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>أحمد محمد</span>
                <span>designer123</span>
              </div>
              <div className="flex justify-between">
                <span>فاطمة أحمد</span>
                <span>designer456</span>
              </div>
              <div className="flex justify-between">
                <span>محمد علي</span>
                <span>designer789</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerLoginDialog;

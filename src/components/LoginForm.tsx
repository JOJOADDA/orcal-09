
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, LogIn } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (userId: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const user = chatService.createUser(formData.name, formData.phone);
      chatService.setCurrentUser(user.id);
      
      toast({
        title: "مرحباً بك!",
        description: `أهلاً وسهلاً ${user.name}، يمكنك الآن إنشاء طلبات التصميم`,
      });
      
      onLogin(user.id);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = () => {
    chatService.setCurrentUser('admin-1');
    onLogin('admin-1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img 
            src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" 
            alt="أوركال للدعاية والإعلان" 
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            أوركال للدعاية والإعلان
          </h1>
          <p className="text-gray-600">منصة طلبات التصميم الذكية</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <LogIn className="w-6 h-6 text-red-500" />
              تسجيل الدخول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
                  <User className="w-4 h-4 text-red-500" />
                  الاسم الكامل
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسمك الكامل"
                  className="h-12 text-lg"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 font-semibold">
                  <Phone className="w-4 h-4 text-red-500" />
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="09xxxxxxxx"
                  className="h-12 text-lg"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-lg bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'دخول'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={handleAdminLogin}
                variant="outline"
                size="sm"
                className="w-full text-sm"
              >
                دخول كأدمن (للاختبار)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>بتسجيل الدخول، أنت توافق على شروط الخدمة</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

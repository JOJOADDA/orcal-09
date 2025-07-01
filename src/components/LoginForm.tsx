
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogIn, Mail, Lock } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (userId: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use supabaseService for authentication
      const { data, error } = await supabaseService.signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        throw error;
      }

      if (data?.user) {
        toast({
          title: "مرحباً بك!",
          description: `أهلاً ${formData.name}، تم تسجيل الدخول بنجاح`
        });
        onLogin(data.user.id);
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    // Create a mock admin login
    try {
      const { data, error } = await supabaseService.signIn('admin@orcal.app', 'admin123');
      if (data?.user && !error) {
        onLogin(data.user.id);
      }
    } catch (error) {
      console.error('Admin login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" alt="أوركال للدعاية والإعلان" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">أوركال للدعاية والإعلان</h1>
          <p className="text-gray-600">منصة التصميم الذكية</p>
        </div>

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
                <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="أدخل اسمك الكامل" className="h-12 text-lg" disabled={isLoading} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 font-semibold">
                  <Mail className="w-4 h-4 text-red-500" />
                  البريد الإلكتروني
                </Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="h-12 text-lg" disabled={isLoading} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 font-semibold">
                  <Lock className="w-4 h-4 text-red-500" />
                  كلمة المرور
                </Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="********" className="h-12 text-lg" disabled={isLoading} required />
              </div>

              <Button type="submit" size="lg" className="w-full h-12 text-lg bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700" disabled={isLoading}>
                {isLoading ? 'جاري تسجيل الدخول...' : 'دخول'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button onClick={handleAdminLogin} variant="outline" size="sm" className="w-full text-sm">
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

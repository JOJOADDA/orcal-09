
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Eye, EyeOff, Mail, Settings } from 'lucide-react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { EnhancedAuthService } from '@/services/auth/enhancedAuthService';
import { useToast } from '@/hooks/use-toast';
import SystemStatus from '@/components/SystemStatus';

interface FastAuthPageProps {
  onAuthSuccess: () => void;
}

const FastAuthPage = ({ onAuthSuccess }: FastAuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: ''
  });
  
  const { signIn } = useOptimizedAuth();
  const { toast } = useToast();

  // تحقق سريع من صحة البيانات
  const loginValidation = useMemo(() => {
    const isValid = loginData.email.includes('@') && loginData.password.length >= 6;
    return { isValid };
  }, [loginData]);

  const signupValidation = useMemo(() => {
    const isValid = signupData.name.length >= 2 && 
                   signupData.email.includes('@') && 
                   signupData.password.length >= 6 && 
                   signupData.password === signupData.confirmPassword;
    return { isValid };
  }, [signupData]);

  // معالج تسجيل الدخول محسن مع التحقق من نوع المستخدم
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginValidation.isValid) return;

    setIsLoading(true);
    try {
      const result = await EnhancedAuthService.signInClient(loginData.email, loginData.password);
      
      if (result.success) {
        toast({ title: "تم تسجيل الدخول بنجاح!" });
        onAuthSuccess();
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [loginData, loginValidation.isValid, toast, onAuthSuccess]);

  // معالج إنشاء الحساب محسن مع التحقق من الإيميل
  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupValidation.isValid) return;

    setIsLoading(true);
    try {
      const result = await EnhancedAuthService.signUpClient({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });

      if (!result.success) {
        toast({
          title: "فشل التسجيل",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      toast({ 
        title: "تم إنشاء الحساب بنجاح!",
        description: "مرحباً بك في أوركال للدعاية والإعلان"
      });
      setTimeout(() => onAuthSuccess(), 1000);
    } catch (error) {
      toast({ 
        title: "خطأ", 
        description: "حدث خطأ أثناء إنشاء الحساب", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [signupData, signupValidation.isValid, toast, onAuthSuccess]);

  if (showSystemStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center px-4">
        <SystemStatus onClose={() => setShowSystemStatus(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
              alt="أوركال للدعاية والإعلان" 
              className="w-24 h-24 object-contain mb-4"
              loading="eager"
            />
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">أوركال للدعاية والإعلان</CardTitle>
              <p className="text-gray-600 text-sm">منصة التصميم الاحترافية</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSystemStatus(true)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="example@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="********"
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

                <Button 
                  type="submit" 
                  disabled={isLoading || !loginValidation.isValid} 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الاسم الكامل
                  </Label>
                  <Input
                    id="signup-name"
                    placeholder="الاسم الكامل"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="signup-email"
                    placeholder="example@email.com"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">كلمة المرور</Label>
                  <Input
                    id="signup-password"
                    placeholder="كلمة المرور (6 أحرف على الأقل)"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">تأكيد كلمة المرور</Label>
                  <Input
                    id="signup-confirm-password"
                    placeholder="تأكيد كلمة المرور"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !signupValidation.isValid} 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FastAuthPage;

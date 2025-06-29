import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const { toast } = useToast();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(loginData.email)) {
      toast({
        title: "خطأ في البريد الإلكتروني",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabaseService.signIn(loginData.email, loginData.password);
      if (error || !data.user) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "تم تسجيل الدخول بنجاح!",
        description: "مرحباً بك في أوركال للدعاية والإعلان"
      });
      onAuthSuccess();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم الكامل", variant: "destructive" });
      return;
    }

    if (!validateEmail(signupData.email)) {
      toast({ title: "خطأ", description: "يرجى إدخال بريد إلكتروني صحيح", variant: "destructive" });
      return;
    }

    if (signupData.password.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabaseService.signUp(
        signupData.email,
        signupData.password,
        signupData.name
      );

      if (error || !data.user) {
        toast({
          title: "فشل التسجيل",
          description: error?.message || "حدث خطأ أثناء إنشاء الحساب",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "تم تسجيل الدخول تلقائياً. مرحباً بك في أوركال"
      });

      setTimeout(() => onAuthSuccess(), 1000);
    } catch (error) {
      console.error('Signup error:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إنشاء الحساب", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <img src="/lovable-uploads/51ae0563-efba-46cb-86b3-70d5ebc74116.png" alt="أوركال" className="w-16 h-16 mx-auto object-contain" />
          <CardTitle className="text-2xl font-bold text-gray-900">أوركال للدعاية والإعلان</CardTitle>
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
                  <Label htmlFor="login-email">البريد الإلكتروني</Label>
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

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  placeholder="الاسم الكامل"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  disabled={isLoading}
                  required
                />
                <Input
                  placeholder="البريد الإلكتروني"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  disabled={isLoading}
                  required
                />
                <Input
                  placeholder="كلمة المرور"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
                <Input
                  placeholder="تأكيد كلمة المرور"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                  required
                />
                <Button type="submit" disabled={isLoading} className="w-full">
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

export default AuthPage;

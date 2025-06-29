
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+249\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
   if (!validatePhone(loginData.phone)) {
  toast({
    title: "خطأ في رقم الهاتف",
    description: "رقم الهاتف يجب أن يبدأ بـ +249 ويتكون من 13 رقمًا",
    variant: "destructive"
  });
  return;
}


    setIsLoading(true);

    try {
      const { data, error } = await supabaseService.signIn(loginData.phone, loginData.password);
      
      if (error) {
        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
        
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials')) {
          errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'لم يتم تأكيد البريد الإلكتروني';
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "تم تسجيل الدخول بنجاح!",
          description: "مرحباً بك في أوركال للدعاية والإعلان"
        });
        onAuthSuccess();
      }
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
    
    // Validate form data
    if (!signupData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الاسم الكامل",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhone(signupData.phone)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabaseService.signUp(
        signupData.phone,
        signupData.password,
        signupData.name
      );
      
      if (error) {
        let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
        
        if (error.message.includes('User already registered') || 
            error.message.includes('already been taken')) {
          errorMessage = 'رقم الهاتف مسجل مسبقاً';
        } else if (error.message.includes('weak password')) {
          errorMessage = 'كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى';
        }
        
        toast({
          title: "خطأ في إنشاء الحساب",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "تم إنشاء الحساب بنجاح!",
          description: "تم تسجيل الدخول تلقائياً. مرحباً بك في أوركال للدعاية والإعلان"
        });
        
        // Wait a moment for the profile to be created
        setTimeout(() => {
          onAuthSuccess();
        }, 1000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <img 
            src="/lovable-uploads/51ae0563-efba-46cb-86b3-70d5ebc74116.png" 
            alt="أوركال" 
            className="w-16 h-16 mx-auto object-contain"
          />
          <CardTitle className="text-2xl font-bold text-gray-900">
            أوركال للدعاية والإعلان
          </CardTitle>
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
                  <Label htmlFor="login-phone" className="flex items-center gap-2 font-semibold">
                    <Phone className="w-4 h-4 text-red-500" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400 text-right"
                    required
                    disabled={isLoading}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2 font-semibold">
                    <Lock className="w-4 h-4 text-red-500" />
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="أدخل كلمة المرور"
                      className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400 pr-12"
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
                  className="w-full h-12 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-semibold rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2 font-semibold">
                    <User className="w-4 h-4 text-red-500" />
                    الاسم الكامل
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="flex items-center gap-2 font-semibold">
                    <Phone className="w-4 h-4 text-red-500" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400 text-right"
                    required
                    disabled={isLoading}
                    dir="ltr"
                  />
                  <p className="text-sm text-gray-500 text-right">
                    يجب أن يبدأ رقم الهاتف بـ 09 ويتكون من 10 أرقام
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2 font-semibold">
                    <Lock className="w-4 h-4 text-red-500" />
                    كلمة المرور
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="flex items-center gap-2 font-semibold">
                    <Lock className="w-4 h-4 text-red-500" />
                    تأكيد كلمة المرور
                  </Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="أعد إدخال كلمة المرور"
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-semibold rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
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

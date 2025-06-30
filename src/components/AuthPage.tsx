import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Eye, EyeOff, Phone, Mail } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    identifier: '', 
    password: '', 
    confirmPassword: '',
    identifierType: 'phone' as 'phone' | 'email'
  });
  const { toast } = useToast();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone: string) => /^\+249[0-9]{9}$/.test(phone);

  const detectIdentifierType = (identifier: string): 'phone' | 'email' => {
    if (identifier.includes('@')) return 'email';
    return 'phone';
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it starts with +249, keep it as is
    if (cleaned.startsWith('+249')) {
      return cleaned;
    }
    
    // If it starts with 249, add +
    if (cleaned.startsWith('249')) {
      return '+' + cleaned;
    }
    
    // If it starts with 0, replace with +249
    if (cleaned.startsWith('0')) {
      return '+249' + cleaned.substring(1);
    }
    
    // If it's just 9 digits, add +249
    if (cleaned.length === 9 && /^\d{9}$/.test(cleaned)) {
      return '+249' + cleaned;
    }
    
    return cleaned;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const identifierType = detectIdentifierType(loginData.identifier);
    
    if (identifierType === 'email' && !validateEmail(loginData.identifier)) {
      toast({
        title: "خطأ في البريد الإلكتروني",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive"
      });
      return;
    }

    if (identifierType === 'phone') {
      const formattedPhone = formatPhoneNumber(loginData.identifier);
      if (!validatePhone(formattedPhone)) {
        toast({
          title: "خطأ في رقم الهاتف",
          description: "يرجى إدخال رقم هاتف صحيح بالمفتاح الدولي +249",
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabaseService.signIn(
        identifierType === 'email' ? loginData.identifier : formatPhoneNumber(loginData.identifier),
        loginData.password,
        identifierType
      );
      
      if (error || !data.user) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: identifierType === 'email' 
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : "رقم الهاتف أو كلمة المرور غير صحيحة",
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

    const identifierType = detectIdentifierType(signupData.identifier);
    
    if (identifierType === 'email' && !validateEmail(signupData.identifier)) {
      toast({ title: "خطأ", description: "يرجى إدخال بريد إلكتروني صحيح", variant: "destructive" });
      return;
    }

    if (identifierType === 'phone') {
      const formattedPhone = formatPhoneNumber(signupData.identifier);
      if (!validatePhone(formattedPhone)) {
        toast({ 
          title: "خطأ", 
          description: "يرجى إدخال رقم هاتف صحيح بالمفتاح الدولي +249", 
          variant: "destructive" 
        });
        return;
      }
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
        identifierType === 'email' ? signupData.identifier : formatPhoneNumber(signupData.identifier),
        signupData.password,
        signupData.name,
        identifierType === 'phone' ? formatPhoneNumber(signupData.identifier) : ''
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
          <img 
            src="/lovable-uploads/ae8abee5-6225-4fe3-97be-58a1b8c1d4b0.png" 
            alt="أوركال للدعاية والإعلان" 
            className="w-20 h-20 mx-auto object-contain"
          />
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
                  <Label htmlFor="login-identifier" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني أو رقم الهاتف
                  </Label>
                  <Input
                    id="login-identifier"
                    type="text"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                    placeholder="example@email.com أو +249123456789"
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
                  <Label htmlFor="signup-identifier" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني أو رقم الهاتف
                  </Label>
                  <Input
                    id="signup-identifier"
                    placeholder="example@email.com أو +249123456789"
                    type="text"
                    value={signupData.identifier}
                    onChange={(e) => setSignupData({ ...signupData, identifier: e.target.value })}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    أدخل رقم الهاتف بالمفتاح الدولي +249 أو بريد إلكتروني صحيح
                  </p>
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

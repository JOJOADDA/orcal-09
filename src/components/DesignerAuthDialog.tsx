
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Lock, Eye, EyeOff, Palette, Mail, Phone, Briefcase, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth/authService';
import { designerService } from '@/services/designers/designerService';

interface DesignerAuthDialogProps {
  onClose: () => void;
  onDesignerLogin: (designerData: { name: string; role: string; email: string }) => void;
}

const DesignerAuthDialog = ({ onClose, onDesignerLogin }: DesignerAuthDialogProps) => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialization: '',
    experienceYears: '0',
    portfolioUrl: ''
  });

  const { toast } = useToast();

  const specializations = [
    'تصميم جرافيك',
    'تصميم مواقع',
    'تصميم هوية بصرية',
    'تصميم إعلانات',
    'تصميم وسائل التواصل الاجتماعي',
    'تصميم طباعة',
    'تصميم تطبيقات',
    'تصميم عام'
  ];

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(loginData.email)) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive"
      });
      return;
    }

    if (loginData.password.length < 6) {
      toast({
        title: "خطأ في البيانات",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting designer login with email:', loginData.email);
      
      const { data, error } = await authService.signIn(loginData.email, loginData.password, 'email');
      
      if (error) {
        let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "يرجى تأكيد البريد الإلكتروني أولاً";
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        console.log('Auth successful, checking designer status for user:', data.user.id);
        
        // البحث عن المصمم بالـ user_id أولاً
        let designer = await designerService.getDesignerByUserId(data.user.id);
        
        // إذا لم نجد بالـ user_id، نبحث بالبريد الإلكتروني
        if (!designer) {
          console.log('Designer not found by user_id, searching by email...');
          designer = await designerService.getDesignerByEmail(loginData.email);
          
          // إذا وجدنا المصمم بالبريد الإلكتروني ولكن user_id غير مربوط، نقوم بربطه
          if (designer && !designer.user_id) {
            console.log('Found designer by email, linking user_id...');
            await designerService.updateDesigner(data.user.id, { user_id: data.user.id });
            designer.user_id = data.user.id;
          }
        }
        
        if (designer) {
          console.log('Designer found:', designer);
          toast({
            title: "تم تسجيل الدخول بنجاح!",
            description: `مرحباً ${designer.name}، يمكنك الآن إدارة المشاريع`
          });
          onDesignerLogin({ 
            name: designer.name, 
            role: 'designer', 
            email: designer.email 
          });
        } else {
          console.log('Designer not found in database');
          toast({
            title: "غير مصرح",
            description: "هذا الحساب غير مسجل كمصمم. يرجى التأكد من إنشاء حساب مصمم أولاً.",
            variant: "destructive"
          });
          await authService.signOut();
        }
      }
    } catch (error) {
      console.error('Designer login error:', error);
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

    // Validation
    if (!signupData.name.trim() || signupData.name.length < 2) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم صحيح (حرفين على الأقل)",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(signupData.email)) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "خطأ في البيانات",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "خطأ في البيانات",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await designerService.signUpDesigner({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        phone: signupData.phone,
        specialization: signupData.specialization || 'تصميم عام',
        experienceYears: parseInt(signupData.experienceYears) || 0,
        portfolioUrl: signupData.portfolioUrl
      });

      if (error) {
        let errorMessage = "حدث خطأ أثناء إنشاء الحساب";
        
        if (error.message.includes('User already registered') || 
            error.message.includes('Designer already exists')) {
          errorMessage = "هذا البريد الإلكتروني مسجل مسبقاً";
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        }
        
        toast({
          title: "فشل التسجيل",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "تم إنشاء الحساب بنجاح!",
          description: "تم إنشاء حساب المصمم بنجاح. يمكنك الآن تسجيل الدخول",
          variant: "default"
        });
        
        // Clear form and switch to login tab
        setSignupData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          specialization: '',
          experienceYears: '0',
          portfolioUrl: ''
        });
        setActiveTab('login');
        
        // Pre-fill login email
        setLoginData({
          email: signupData.email,
          password: ''
        });
      }
    } catch (error) {
      console.error('Designer signup error:', error);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-6 h-6 text-orange-500" />
            منصة المصممين
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
              انضم إلى فريق المصممين المحترفين
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">تسجيل دخول المصمم</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-500" />
                        البريد الإلكتروني
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="designer@example.com"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-500" />
                        كلمة المرور
                      </Label>
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
                      disabled={isLoading} 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إنشاء حساب مصمم جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-500" />
                          الاسم الكامل *
                        </Label>
                        <Input
                          id="signup-name"
                          placeholder="اسم المصمم"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-500" />
                          البريد الإلكتروني *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="designer@example.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">كلمة المرور *</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="6 أحرف على الأقل"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            disabled={isLoading}
                            required
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

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password">تأكيد كلمة المرور *</Label>
                        <div className="relative">
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="تأكيد كلمة المرور"
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                            disabled={isLoading}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-orange-500" />
                          رقم الهاتف
                        </Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+249123456789"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-specialization" className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-orange-500" />
                          التخصص
                        </Label>
                        <Select
                          value={signupData.specialization}
                          onValueChange={(value) => setSignupData({ ...signupData, specialization: value })}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر التخصص" />
                          </SelectTrigger>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-experience">سنوات الخبرة</Label>
                        <Select
                          value={signupData.experienceYears}
                          onValueChange={(value) => setSignupData({ ...signupData, experienceYears: value })}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر سنوات الخبرة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">مبتدئ</SelectItem>
                            <SelectItem value="1">سنة واحدة</SelectItem>
                            <SelectItem value="2">سنتان</SelectItem>
                            <SelectItem value="3">3 سنوات</SelectItem>
                            <SelectItem value="4">4 سنوات</SelectItem>
                            <SelectItem value="5">5 سنوات أو أكثر</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-portfolio" className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-orange-500" />
                          رابط الأعمال (اختياري)
                        </Label>
                        <Input
                          id="signup-portfolio"
                          type="url"
                          placeholder="https://portfolio.com (اختياري)"
                          value={signupData.portfolioUrl}
                          onChange={(e) => setSignupData({ ...signupData, portfolioUrl: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب المصمم'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesignerAuthDialog;

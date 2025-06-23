import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Palette, Phone, User, FileText, Clock, Star, CheckCircle, Award, Users, Heart, Zap } from 'lucide-react';
const DesignOrderForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    designType: '',
    description: ''
  });
  const designTypes = ['تصميم شعار (Logo)', 'هوية بصرية كاملة', 'منشورات سوشيال ميديا', 'تصميم بروشور أو فلاير', 'تصميم بانر إعلاني', 'تصميم كارت شخصي', 'تصميم غلاف فيسبوك', 'تصميم عرض تقديمي', 'تصميم تغليف منتج', 'أخرى'];
  const features = [{
    icon: Clock,
    title: 'تسليم سريع',
    desc: 'خلال 24-48 ساعة'
  }, {
    icon: Award,
    title: 'جودة عالية',
    desc: 'تصاميم احترافية'
  }, {
    icon: Users,
    title: '+500 عميل',
    desc: 'راضي عن خدماتنا'
  }, {
    icon: Heart,
    title: 'دعم مستمر',
    desc: 'متابعة ما بعد التسليم'
  }];
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.designType || !formData.description) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const message = `
🎨 *طلب تصميم جديد من أوركال*

👤 *الاسم:* ${formData.name}
📱 *رقم الهاتف:* ${formData.phone}
🎨 *نوع التصميم:* ${formData.designType}
📝 *تفاصيل التصميم:* ${formData.description}

*شركة أوركال للدعاية والإعلان*
نحن في انتظار خدمتكم! 🌟
    `.trim();
    const phoneNumber = '966501234567';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  return <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl bg-gray-100">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-8">
            <img src="/lovable-uploads/6335bf9e-3114-421a-a6ee-6490ab0c3d43.png" alt="أوركال للدعاية والإعلان" className="w-32 h-32 object-contain" />
          </div>
          <h1 className="font-cairo font-bold text-5xl text-gray-900 mb-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent px-[79px] py-[15px]">
            أوركال للدعاية والإعلان
          </h1>
          <p className="font-cairo text-xl text-gray-700 mb-2">
            نحول أفكارك إلى تصاميم إبداعية مذهلة
          </p>
          <p className="font-cairo text-lg text-gray-600 mb-8">
            خبرة تزيد عن 10 سنوات في عالم الدعاية والإعلان والإنتاج الفني
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature, index) => <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-gradient-to-r from-red-500 to-purple-600" style={{
              color: '#e11d48'
            }} />
                <h3 className="font-cairo font-bold text-gray-900 text-sm mb-1">{feature.title}</h3>
                <p className="font-cairo text-xs text-gray-600">{feature.desc}</p>
              </div>)}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 bg-white/60 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-cairo font-bold">4.9/5</span>
              <span className="font-cairo">تقييم العملاء</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="font-cairo">+500 مشروع مكتمل</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="font-cairo">ضمان الجودة 100%</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Company Info */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="font-cairo text-2xl text-gray-900 flex items-center gap-3">
                  <Palette className="w-7 h-7 text-red-500" />
                  لماذا أوركال؟
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-cairo font-bold text-gray-900 mb-1">خبرة واسعة</h4>
                      <p className="font-cairo text-gray-700 text-sm">أكثر من 10 سنوات في مجال الدعاية والإعلان والإنتاج الفني</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <Zap className="w-6 h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-cairo font-bold text-gray-900 mb-1">سرعة في التنفيذ</h4>
                      <p className="font-cairo text-gray-700 text-sm">نضمن تسليم تصاميمك في الوقت المحدد دون تأخير</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                    <Award className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-cairo font-bold text-gray-900 mb-1">جودة مضمونة</h4>
                      <p className="font-cairo text-gray-700 text-sm">تصاميم احترافية تواكب أحدث الاتجاهات العالمية</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-purple-600 rounded-xl p-6 text-white">
                  <h4 className="font-cairo font-bold text-lg mb-2">خدماتنا الشاملة</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="font-cairo">• تصميم الشعارات</span>
                    <span className="font-cairo">• الهوية البصرية</span>
                    <span className="font-cairo">• التصميم الرقمي</span>
                    <span className="font-cairo">• المطبوعات</span>
                    <span className="font-cairo">• السوشيال ميديا</span>
                    <span className="font-cairo">• العروض التقديمية</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Form */}
          <Card className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md border-0 shadow-2xl sticky top-8">
            <CardHeader className="text-center">
              <CardTitle className="font-cairo text-3xl text-gray-900 flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-red-500" />
                اطلب تصميمك الآن
              </CardTitle>
              <p className="font-cairo text-gray-600 mt-2">أرسل بياناتك وسنتواصل معك فوراً</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-cairo text-gray-800 flex items-center gap-2 font-semibold">
                    <User className="w-5 h-5 text-red-500" />
                    الاسم الكامل *
                  </Label>
                  <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="أدخل اسمك الكامل" className="font-cairo h-14 text-lg border-2 border-gray-200 focus:border-red-400 rounded-xl" required />
                </div>
                
                <div className="space-y-2">
                  
                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designType" className="font-cairo text-gray-800 flex items-center gap-2 font-semibold">
                    <Palette className="w-5 h-5 text-red-500" />
                    نوع التصميم المطلوب *
                  </Label>
                  <select id="designType" name="designType" value={formData.designType} onChange={handleInputChange} className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 font-cairo bg-white focus:outline-none focus:border-red-400 text-lg" required>
                    <option value="">اختر نوع التصميم</option>
                    {designTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-cairo text-gray-800 font-semibold">
                    تفاصيل التصميم المطلوب *
                  </Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="اكتب هنا تفاصيل التصميم بدقة: الألوان المفضلة، النص المطلوب، الأسلوب، أي ملاحظات خاصة..." className="font-cairo min-h-[140px] resize-none border-2 border-gray-200 focus:border-red-400 rounded-xl text-lg" required />
                </div>

                <Button type="submit" size="lg" className="w-full font-cairo text-xl py-8 bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 hover:from-red-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-2xl rounded-xl">
                  <Send className="w-6 h-6 ml-3" />
                  إرسال الطلب عبر واتساب
                </Button>

                <div className="text-center pt-4">
                  <p className="font-cairo text-gray-600 text-sm flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    سنرد عليك خلال دقائق معدودة
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="font-cairo font-bold text-2xl text-gray-900 mb-4">
              أوركال للدعاية والإعلان والإنتاج الفني
            </h3>
            <p className="font-cairo text-gray-700 mb-4">
              نحن نؤمن بأن كل علامة تجارية تستحق هوية بصرية مميزة تعكس شخصيتها وتجذب جمهورها
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span className="font-cairo">📧 info@orcal.com</span>
              <span className="font-cairo">📱 0112596876</span>
              <span className="font-cairo">🌐 www.orcal.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default DesignOrderForm;
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

  const designTypes = [
    'تصميم شعار (Logo)',
    'هوية بصرية كاملة',
    'منشورات سوشيال ميديا',
    'تصميم بروشور أو فلاير',
    'تصميم بانر إعلاني',
    'تصميم كارت شخصي',
    'تصميم غلاف فيسبوك',
    'تصميم عرض تقديمي',
    'تصميم تغليف منتج',
    'أخرى'
  ];

  const features = [
    { icon: Clock, title: 'تسليم سريع', desc: 'خلال 24-48 ساعة' },
    { icon: Award, title: 'جودة عالية', desc: 'تصاميم احترافية' },
    { icon: Users, title: '+500 عميل', desc: 'راضي عن خدماتنا' },
    { icon: Heart, title: 'دعم مستمر', desc: 'متابعة ما بعد التسليم' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 py-4 px-4 sm:py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <img 
              src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" 
              alt="أوركال للدعاية والإعلان" 
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
            />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-3 sm:mb-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent px-4">
            أوركال للدعاية والإعلان
          </h1>
          <p className="font-body text-lg sm:text-xl text-gray-700 mb-2 px-4 font-medium">
            نحول أفكارك إلى تصاميم إبداعية مذهلة
          </p>
          <p className="font-body text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
            خبرة تزيد عن 20 سنة في عالم الدعاية والإعلان والإنتاج الفني
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 px-2">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-display font-bold text-gray-900 text-xs sm:text-sm mb-1">{feature.title}</h3>
                <p className="font-body text-xs text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600 bg-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-sm mx-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-display font-bold">4.9/5</span>
              <span className="font-body">تقييم العملاء</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="font-body">+500 مشروع مكتمل</span>
            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="font-body">ضمان الجودة 100%</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          {/* Left Side - Company Info */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md border-0 shadow-2xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="font-display text-xl sm:text-2xl text-gray-900 flex items-center gap-3">
                  <Palette className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
                  لماذا أوركال؟
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base">خبرة واسعة</h4>
                      <p className="font-body text-gray-700 text-xs sm:text-sm">أكثر من 20 سنة في مجال الدعاية والإعلان والإنتاج الفني</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base">سرعة في التنفيذ</h4>
                      <p className="font-body text-gray-700 text-xs sm:text-sm">نضمن تسليم تصاميمك في الوقت المحدد دون تأخير</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base">جودة مضمونة</h4>
                      <p className="font-body text-gray-700 text-xs sm:text-sm">تصاميم احترافية تواكب أحدث الاتجاهات العالمية</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
                  <h4 className="font-display font-bold text-base sm:text-lg mb-2">خدماتنا الشاملة</h4>
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="font-body">• تصميم الشعارات</span>
                    <span className="font-body">• الهوية البصرية</span>
                    <span className="font-body">• التصميم الرقمي</span>
                    <span className="font-body">• المطبوعات</span>
                    <span className="font-body">• السوشيال ميديا</span>
                    <span className="font-body">• العروض التقديمية</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Form */}
          <Card className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md border-0 shadow-2xl sticky top-4 order-1 lg:order-2">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="font-display text-2xl sm:text-3xl text-gray-900 flex items-center justify-center gap-3">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                اطلب تصميمك الآن
              </CardTitle>
              <p className="font-body text-gray-600 mt-2 text-sm sm:text-base">أرسل بياناتك وسنتواصل معك فوراً</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-display text-gray-800 flex items-center gap-2 font-semibold text-sm sm:text-base">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    الاسم الكامل *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسمك الكامل"
                    className="font-body h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-red-400 rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-display text-gray-800 flex items-center gap-2 font-semibold text-sm sm:text-base">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    رقم الهاتف *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="05xxxxxxxx"
                    className="font-body h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-red-400 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designType" className="font-display text-gray-800 flex items-center gap-2 font-semibold text-sm sm:text-base">
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    نوع التصميم المطلوب *
                  </Label>
                  <select
                    id="designType"
                    name="designType"
                    value={formData.designType}
                    onChange={handleInputChange}
                    className="w-full h-12 sm:h-14 px-4 rounded-xl border-2 border-gray-200 font-body bg-white focus:outline-none focus:border-red-400 text-base sm:text-lg"
                    required
                  >
                    <option value="">اختر نوع التصميم</option>
                    {designTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-display text-gray-800 font-semibold text-sm sm:text-base">
                    تفاصيل التصميم المطلوب *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="اكتب هنا تفاصيل التصميم بدقة: الألوان المفضلة، النص المطلوب، الأسلوب، أي ملاحظات خاصة..."
                    className="font-body min-h-[120px] sm:min-h-[140px] resize-none border-2 border-gray-200 focus:border-red-400 rounded-xl text-base sm:text-lg"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-display text-lg sm:text-xl py-6 sm:py-8 bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 hover:from-red-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-2xl rounded-xl"
                >
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 ml-3" />
                  إرسال الطلب عبر واتساب
                </Button>

                <div className="text-center pt-2 sm:pt-4">
                  <p className="font-body text-gray-600 text-xs sm:text-sm flex items-center justify-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    سنرد عليك خلال دقائق معدودة
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm mx-2">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-gray-900 mb-3 sm:mb-4">
              أوركال للدعاية والإعلان والإنتاج الفني
            </h3>
            <p className="font-body text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base px-2">
              نحن نؤمن بأن كل علامة تجارية تستحق هوية بصرية مميزة تعكس شخصيتها وتجذب جمهورها
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span className="font-body">📧 info@orcal.com</span>
              <span className="font-body">📱 0112596876</span>
              <span className="font-body">🌐 www.orcal.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignOrderForm;

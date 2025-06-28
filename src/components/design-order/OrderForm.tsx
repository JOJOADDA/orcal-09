
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Phone, Palette, FileText, Clock, Star, Shield } from 'lucide-react';

const OrderForm = () => {
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
    'تصميم مطبوعات',
    'تصميم عرض تقديمي',
    'تصميم تغليف منتج',
    'أخرى'
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

    const phoneNumber = '+249112596876';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md border-0 shadow-2xl lg:sticky lg:top-4 overflow-hidden">
      <CardHeader className="text-center p-4 sm:p-6 bg-gradient-to-r from-red-50 via-purple-50 to-blue-50">
        <CardTitle className="font-display text-xl sm:text-2xl md:text-3xl text-gray-900 flex items-center justify-center gap-2 sm:gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-red-500 to-purple-600 rounded-full">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          اطلب تصميمك الآن
        </CardTitle>
        <p className="font-body text-gray-600 text-sm sm:text-base leading-relaxed">
          أرسل بياناتك وسنتواصل معك فوراً
        </p>
        
        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span>آمن ومضمون</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>+500 عميل راضي</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-display text-gray-800 flex items-center gap-2 font-semibold text-sm sm:text-base">
              <div className="p-1 bg-red-100 rounded-full">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              </div>
              اسم العميل *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="أدخل اسمك الكامل"
              className="font-body h-12 sm:h-14 text-sm sm:text-base border-2 border-gray-200 focus:border-red-400 rounded-xl transition-all duration-300 hover:border-gray-300"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-display text-gray-800 flex items-center gap-2 font-semibold text-sm sm:text-base">
              <div className="p-1 bg-red-100 rounded-full">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              </div>
              رقم الهاتف *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="09xxxxxxxx"
              className="font-body h-12 sm:h-14 text-sm sm:text-base border-2 border-gray-200 focus:border-red-400 rounded-xl transition-all duration-300 hover:border-gray-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designType" className="font-display text-gray-800 flex items-center gap-2 font-semibold text-sm sm:text-base">
              <div className="p-1 bg-red-100 rounded-full">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              </div>
              نوع التصميم المطلوب *
            </Label>
            <select
              id="designType"
              name="designType"
              value={formData.designType}
              onChange={handleInputChange}
              className="w-full h-12 sm:h-14 px-4 rounded-xl border-2 border-gray-200 font-body bg-white focus:outline-none focus:border-red-400 text-sm sm:text-base transition-all duration-300 hover:border-gray-300"
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
              className="font-body min-h-[120px] sm:min-h-[140px] resize-none border-2 border-gray-200 focus:border-red-400 rounded-xl text-sm sm:text-base transition-all duration-300 hover:border-gray-300"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-display text-base sm:text-lg py-6 sm:py-8 bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 hover:from-red-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-[1.02] active:scale-98 transition-all duration-300 shadow-2xl rounded-xl group"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
            إرسال الطلب عبر واتساب
          </Button>

          <div className="text-center pt-2 sm:pt-4">
            <div className="flex items-center justify-center gap-2 bg-green-50 rounded-xl p-3">
              <Clock className="w-4 h-4 text-green-500 animate-pulse" />
              <p className="font-body text-green-700 text-xs sm:text-sm font-medium">
                سنرد عليك خلال دقائق معدودة
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;

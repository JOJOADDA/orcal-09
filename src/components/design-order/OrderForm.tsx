
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, User, Phone, Palette, FileText, Clock } from 'lucide-react';

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
    <Card className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md border-0 shadow-2xl lg:sticky lg:top-4">
      <CardHeader className="text-center p-3 sm:p-4 md:p-6">
        <CardTitle className="font-display text-xl sm:text-2xl md:text-3xl text-gray-900 flex items-center justify-center gap-2 sm:gap-3">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-500" />
          اطلب تصميمك الآن
        </CardTitle>
        <p className="font-body text-gray-600 mt-2 text-sm sm:text-base">أرسل بياناتك وسنتواصل معك فوراً</p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-display text-gray-800 flex items-center gap-2 font-semibold text-sm sm:text-base">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              اسم العميل *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="أدخل اسمك الكامل"
              className="font-body h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 focus:border-red-400 rounded-lg sm:rounded-xl"
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
              placeholder="09xxxxxxxx"
              className="font-body h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 focus:border-red-400 rounded-lg sm:rounded-xl"
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
              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 rounded-lg sm:rounded-xl border-2 border-gray-200 font-body bg-white focus:outline-none focus:border-red-400 text-sm sm:text-base md:text-lg"
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
              className="font-body min-h-[100px] sm:min-h-[120px] md:min-h-[140px] resize-none border-2 border-gray-200 focus:border-red-400 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-display text-base sm:text-lg md:text-xl py-4 sm:py-6 md:py-8 bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 hover:from-red-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl rounded-lg sm:rounded-xl"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3" />
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
  );
};

export default OrderForm;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Phone, FileText, Palette } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  designType: string;
  description: string;
}

const DesignOrderForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    designType: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة الاسم
    if (!formData.name || formData.name.trim().length < 2) {
      alert('يرجى إدخال اسم صحيح لا يقل عن حرفين');
      return;
    }

    // التحقق من رقم الهاتف السوداني
    if (!/^09\d{8}$/.test(formData.phone)) {
      alert('يرجى إدخال رقم هاتف سوداني صحيح يبدأ بـ 09 ويتكون من 10 أرقام');
      return;
    }

    // التحقق من نوع التصميم
    if (!formData.designType) {
      alert('يرجى اختيار نوع التصميم المطلوب');
      return;
    }

    // التحقق من الوصف
    if (!formData.description || formData.description.trim().length < 10) {
      alert('يرجى كتابة تفاصيل كافية للتصميم (10 أحرف على الأقل)');
      return;
    }

    // تنسيق الرسالة
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

    // فتح واتساب في نافذة جديدة
    window.open(whatsappUrl, '_blank');

    // إعادة تعيين البيانات
    setFormData({ name: '', phone: '', designType: '', description: '' });

    // عرض رسالة نجاح وتوجيه بعد ثانيتين
    alert('✅ تم إرسال طلبك بنجاح! سيتم تحويلك إلى صفحة الشكر.');
    setTimeout(() => {
      window.location.href = '/thanks';
    }, 2000);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const designTypes = [
    { value: 'لوجو', label: '🎯 تصميم شعار (لوجو)' },
    { value: 'بوستر', label: '📄 تصميم بوستر إعلاني' },
    { value: 'بروشور', label: '📋 تصميم بروشور' },
    { value: 'كرت شخصي', label: '💳 تصميم كرت شخصي' },
    { value: 'هوية بصرية', label: '🏢 تصميم هوية بصرية كاملة' },
    { value: 'منشورات سوشيال ميديا', label: '📱 منشورات سوشيال ميديا' },
    { value: 'تصميم موقع', label: '🌐 تصميم موقع إلكتروني' },
    { value: 'أخرى', label: '✨ أخرى (حدد في الوصف)' },
  ];

  return (
    <section className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-lg mx-auto">
        {/* Simple Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-700 font-arabic mb-2">
            🎨 شركة أوركال للدعاية والإعلان
          </h1>
          <p className="text-gray-600 font-arabic">
            اطلب تصميمك الاحترافي الآن
          </p>
        </div>

        {/* Simple Form Card */}
        <Card className="shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 font-arabic text-center">
              نموذج طلب التصميم
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-arabic font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  الاسم الكريم
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="مثال: محمد أحمد علي"
                  className="font-arabic text-right"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-arabic font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  رقم الهاتف (واتساب)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="مثال: 0912345678"
                  className="font-arabic text-right"
                  required
                />
                <p className="text-xs text-gray-500 font-arabic">* يجب أن يبدأ بـ 09 ويتكون من 10 أرقام</p>
              </div>

              {/* Design Type Field */}
              <div className="space-y-2">
                <Label htmlFor="designType" className="font-arabic font-medium text-gray-700 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-500" />
                  نوع التصميم المطلوب
                </Label>
                <select
                  id="designType"
                  value={formData.designType}
                  onChange={(e) => handleInputChange('designType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md font-arabic text-right bg-white"
                  required
                >
                  <option value="">اختر نوع التصميم</option>
                  {designTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-arabic font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  تفاصيل التصميم
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="اكتب تفاصيل التصميم المطلوب، الألوان المفضلة، والأفكار الخاصة بك..."
                  className="font-arabic text-right min-h-[100px] resize-none"
                  required
                />
                <p className="text-xs text-gray-500 font-arabic">* اكتب تفاصيل كافية (10 أحرف على الأقل)</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-arabic font-bold py-3 text-lg"
              >
                <Send className="w-5 h-5 ml-2" />
                إرسال الطلب عبر واتساب
              </Button>
            </form>

            {/* Simple Info */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 font-arabic font-medium text-center text-sm">
                ✅ سنتواصل معك خلال دقائق عبر واتساب
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Simple Features */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl mb-1">⚡</div>
            <p className="font-arabic text-xs text-gray-600">تسليم سريع</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl mb-1">✨</div>
            <p className="font-arabic text-xs text-gray-600">جودة عالية</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl mb-1">🎯</div>
            <p className="font-arabic text-xs text-gray-600">ضمان الرضا</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignOrderForm;

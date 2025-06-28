
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Send, User, Phone, FileText, Sparkles } from 'lucide-react';

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
    { value: 'لوجو', label: '🎯 تصميم شعار (لوجو)', icon: '🎯' },
    { value: 'بوستر', label: '📄 تصميم بوستر إعلاني', icon: '📄' },
    { value: 'بروشور', label: '📋 تصميم بروشور', icon: '📋' },
    { value: 'كرت شخصي', label: '💳 تصميم كرت شخصي', icon: '💳' },
    { value: 'هوية بصرية', label: '🏢 تصميم هوية بصرية كاملة', icon: '🏢' },
    { value: 'منشورات سوشيال ميديا', label: '📱 منشورات سوشيال ميديا', icon: '📱' },
    { value: 'تصميم موقع', label: '🌐 تصميم موقع إلكتروني', icon: '🌐' },
    { value: 'أخرى', label: '✨ أخرى (حدد في الوصف)', icon: '✨' },
  ];

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span className="font-arabic text-purple-600 font-bold text-lg">شركة أوركال للدعاية والإعلان</span>
            <Palette className="w-6 h-6 text-purple-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent font-arabic leading-tight">
            اطلب تصميمك الاحترافي
          </h1>
          
          <p className="text-xl text-gray-600 font-arabic max-w-lg mx-auto leading-relaxed">
            املأ النموذج أدناه وسنتواصل معك فوراً عبر واتساب لتحويل أفكارك إلى تصاميم مذهلة
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-8 rtl:space-x-reverse text-sm">
            <div className="flex items-center space-x-1 rtl:space-x-reverse text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-arabic font-medium">متاح الآن</span>
            </div>
            <div className="text-gray-500 font-arabic">⭐ 4.9/5 تقييم ممتاز</div>
            <div className="text-gray-500 font-arabic">🚀 تسليم سريع</div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 p-1">
            <div className="bg-white rounded-t-lg">
              <CardHeader className="text-center space-y-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-t-lg">
                <CardTitle className="text-3xl font-bold text-gray-800 font-arabic flex items-center justify-center space-x-3 rtl:space-x-reverse">
                  <Palette className="w-8 h-8 text-purple-500" />
                  <span>نموذج طلب التصميم</span>
                  <Sparkles className="w-8 h-8 text-pink-500" />
                </CardTitle>
                <p className="text-gray-600 font-arabic text-lg">
                  جميع الحقول مطلوبة للحصول على أفضل خدمة
                </p>
              </CardHeader>
            </div>
          </div>

          <CardContent className="p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="font-arabic font-bold text-gray-700 text-lg flex items-center space-x-2 rtl:space-x-reverse">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>اسم العميل الكريم</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="مثال: محمد أحمد علي"
                  className="font-arabic text-right text-lg py-4 border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-purple-50/50 transition-all duration-300"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="font-arabic font-bold text-gray-700 text-lg flex items-center space-x-2 rtl:space-x-reverse">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span>رقم الهاتف (واتساب)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="مثال: 0912345678"
                  className="font-arabic text-right text-lg py-4 border-2 border-blue-200 focus:border-blue-500 rounded-xl bg-blue-50/50 transition-all duration-300"
                  required
                />
                <p className="text-sm text-gray-500 font-arabic">* يجب أن يبدأ بـ 09 ويتكون من 10 أرقام</p>
              </div>

              {/* Design Type Field */}
              <div className="space-y-3">
                <Label htmlFor="designType" className="font-arabic font-bold text-gray-700 text-lg flex items-center space-x-2 rtl:space-x-reverse">
                  <Palette className="w-5 h-5 text-pink-500" />
                  <span>نوع التصميم المطلوب</span>
                </Label>
                <select
                  id="designType"
                  value={formData.designType}
                  onChange={(e) => handleInputChange('designType', e.target.value)}
                  className="w-full p-4 border-2 border-pink-200 focus:border-pink-500 rounded-xl font-arabic text-right bg-pink-50/50 text-lg transition-all duration-300 cursor-pointer"
                  required
                >
                  <option value="">اختر نوع التصميم المناسب لك</option>
                  {designTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div className="space-y-3">
                <Label htmlFor="description" className="font-arabic font-bold text-gray-700 text-lg flex items-center space-x-2 rtl:space-x-reverse">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span>تفاصيل التصميم والمتطلبات</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="مثال: أريد تصميم شعار لمطعم يقدم الأكل الشعبي السوداني، الألوان المفضلة الأخضر والأصفر، يجب أن يكون بسيط ومميز ويعكس التراث السوداني..."
                  className="font-arabic text-right min-h-[150px] text-lg border-2 border-indigo-200 focus:border-indigo-500 rounded-xl bg-indigo-50/50 transition-all duration-300 resize-none"
                  required
                />
                <p className="text-sm text-gray-500 font-arabic">* اكتب تفاصيل كافية (10 أحرف على الأقل) حتى نتمكن من خدمتك بأفضل شكل</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white font-arabic font-bold py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-xl"
              >
                <Send className="w-6 h-6 ml-3" />
                إرسال الطلب عبر واتساب الآن
                <Sparkles className="w-6 h-6 mr-3" />
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <div className="text-center space-y-2">
                <p className="text-green-700 font-arabic font-bold">🎉 مبروك! أنت على بُعد خطوة واحدة من الحصول على تصميمك</p>
                <p className="text-gray-600 font-arabic text-sm">سنتواصل معك خلال دقائق عبر واتساب لتأكيد طلبك ومناقشة التفاصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-arabic font-bold text-lg text-gray-800 mb-2">تسليم سريع</h3>
            <p className="text-gray-600 font-arabic text-sm">خلال 24-48 ساعة</p>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="font-arabic font-bold text-lg text-gray-800 mb-2">جودة عالية</h3>
            <p className="text-gray-600 font-arabic text-sm">تصاميم احترافية مميزة</p>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-arabic font-bold text-lg text-gray-800 mb-2">ضمان الرضا</h3>
            <p className="text-gray-600 font-arabic text-sm">تعديلات مجانية حتى الرضا</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignOrderForm;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
      window.location.href = '/thanks'; // عدّل هذا الرابط إذا كنت تستخدم صفحة شكر مختلفة
    }, 2000);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold text-purple-800 font-arabic">
              طلب تصميم جديد
            </CardTitle>
            <p className="text-gray-600 font-arabic">
              املأ النموذج أدناه وسنتواصل معك عبر واتساب
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-arabic font-semibold text-gray-700">
                  اسم العميل
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="اكتب اسمك الكامل"
                  className="font-arabic text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-arabic font-semibold text-gray-700">
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="font-arabic text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designType" className="font-arabic font-semibold text-gray-700">
                  نوع التصميم المطلوب
                </Label>
                <select
                  id="designType"
                  value={formData.designType}
                  onChange={(e) => handleInputChange('designType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md font-arabic text-right bg-white"
                  required
                >
                  <option value="">اختر نوع التصميم</option>
                  <option value="لوجو">تصميم لوجو</option>
                  <option value="بوستر">تصميم بوستر</option>
                  <option value="بروشور">تصميم بروشور</option>
                  <option value="كرت شخصي">تصميم كرت شخصي</option>
                  <option value="هوية بصرية">تصميم هوية بصرية كاملة</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-arabic font-semibold text-gray-700">
                  تفاصيل التصميم
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="اكتب تفاصيل التصميم المطلوب، الألوان المفضلة، والرسالة التي تريد إيصالها..."
                  className="font-arabic text-right min-h-[120px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-arabic font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                إرسال الطلب عبر واتساب 📱
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DesignOrderForm;

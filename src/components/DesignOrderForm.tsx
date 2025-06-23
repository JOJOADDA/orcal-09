
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Palette, Phone, User, FileText, Clock } from 'lucide-react';

const DesignOrderForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    designType: '',
    description: '',
    budget: '',
    timeline: ''
  });

  const designTypes = [
    'تصميم شعار',
    'منشورات سوشيال ميديا',
    'تصميم بروشور أو فلاير',
    'تصميم موقع أو تطبيق',
    'هوية بصرية كاملة',
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
    
    // التحقق من المدخلات المطلوبة
    if (!formData.name || !formData.phone || !formData.designType || !formData.description) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // إنشاء رسالة الواتساب
    const message = `
🎨 *طلب تصميم جديد*

👤 *الاسم:* ${formData.name}
📱 *رقم الهاتف:* ${formData.phone}
🎨 *نوع التصميم:* ${formData.designType}
📝 *تفاصيل التصميم:* ${formData.description}
💰 *الميزانية المتوقعة:* ${formData.budget || 'غير محددة'}
⏰ *الإطار الزمني:* ${formData.timeline || 'غير محدد'}

شكراً لك، سنتواصل معك قريباً! 🙏
    `.trim();

    // رقم الواتساب (يمكنك تغييره)
    const phoneNumber = '966501234567';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // فتح رابط الواتساب
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-cairo font-bold text-4xl text-gray-900 mb-4">
            اطلب تصميمك الآن
          </h1>
          <p className="font-cairo text-lg text-gray-600 mb-8">
            املأ النموذج أدناه وسنتواصل معك عبر واتساب فوراً لبدء تنفيذ تصميمك
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 bg-white/70 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="font-cairo">رد سريع خلال دقائق</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-500" />
              <span className="font-cairo">تواصل مباشر</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="font-cairo text-2xl text-gray-900 flex items-center justify-center gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              نموذج طلب التصميم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-cairo text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    الاسم الكامل *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسمك الكامل"
                    className="font-cairo h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-cairo text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="05xxxxxxxx"
                    className="font-cairo h-12"
                    required
                  />
                </div>
              </div>

              {/* Design Type */}
              <div className="space-y-2">
                <Label htmlFor="designType" className="font-cairo text-gray-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  نوع التصميم المطلوب *
                </Label>
                <select
                  id="designType"
                  name="designType"
                  value={formData.designType}
                  onChange={handleInputChange}
                  className="w-full h-12 px-3 rounded-md border border-gray-300 font-cairo bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">اختر نوع التصميم</option>
                  {designTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-cairo text-gray-700">
                  وصف التصميم المطلوب بالتفصيل *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="اكتب هنا تفاصيل التصميم الذي تريده، الألوان المفضلة، الأسلوب، أي ملاحظات خاصة..."
                  className="font-cairo min-h-[120px] resize-none"
                  required
                />
              </div>

              {/* Budget and Timeline */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="font-cairo text-gray-700">
                    الميزانية المتوقعة (اختياري)
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="text"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="مثال: 500 ريال"
                    className="font-cairo h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeline" className="font-cairo text-gray-700">
                    الإطار الزمني المطلوب (اختياري)
                  </Label>
                  <Input
                    id="timeline"
                    name="timeline"
                    type="text"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    placeholder="مثال: خلال 3 أيام"
                    className="font-cairo h-12"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full font-cairo text-lg py-6 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
              >
                <Send className="w-5 h-5 ml-2" />
                إرسال الطلب عبر واتساب
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="font-cairo text-gray-600 text-sm">
            سيتم توجيهك إلى واتساب لإتمام الطلب والتواصل المباشر مع فريق التصميم
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignOrderForm;

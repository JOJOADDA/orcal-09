
import { Check, Star, Crown, Zap, ArrowLeft, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingSection = () => {
  const plans = [
    {
      name: 'Basic',
      nameAr: 'الأساسي',
      price: '149',
      originalPrice: '199',
      description: 'مثالي للأفراد والمشاريع الصغيرة',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      deliveryTime: '48 ساعة',
      features: [
        'تصميم شعار واحد أو منشور واحد',
        '3 مراجعات مجانية', 
        'ملفات عالية الجودة (PNG, JPG)',
        'تسليم خلال 48 ساعة',
        'دعم فني',
        'حقوق ملكية كاملة'
      ],
      popular: false,
      whatsappMessage: 'أريد طلب الباقة الأساسية - 149 ريال'
    },
    {
      name: 'Professional',
      nameAr: 'المحترف',
      price: '299',
      originalPrice: '399',
      description: 'الأنسب للشركات والمتاجر الإلكترونية',
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      deliveryTime: '24 ساعة',
      features: [
        'تصميم شعار + 3 متغيرات أو 5 منشورات',
        '5 مراجعات مجانية',
        'جميع ملفات التصميم (AI, PSD, PNG, JPG)',
        'تسليم خلال 24 ساعة',
        'تصميم بطاقة عمل مجاناً',
        'دعم فني متقدم',
        'حقوق ملكية كاملة',
        'ضمان رضا 100%'
      ],
      popular: true,
      whatsappMessage: 'أريد طلب الباقة المحترفة - 299 ريال'
    },
    {
      name: 'Premium',
      nameAr: 'المميز',
      price: '599',
      originalPrice: '799',
      description: 'حل متكامل للشركات الكبيرة والعلامات التجارية',
      icon: Crown,
      color: 'from-purple-600 to-pink-600',
      deliveryTime: '12 ساعة',
      features: [
        'هوية بصرية كاملة أو 10 تصاميم',
        'مراجعات غير محدودة',
        'جميع الملفات والصيغ المطلوبة',
        'تسليم خلال 12 ساعة',
        'تصميم بطاقة عمل + ورقة رسمية',
        'تصميم مغلف وختم',
        'دليل استخدام الهوية',
        'دعم VIP مدى الحياة',
        'حقوق ملكية كاملة'
      ],
      popular: false,
      whatsappMessage: 'أريد طلب الباقة المميزة - 599 ريال'
    }
  ];

  const handleWhatsAppOrder = (message: string) => {
    const phoneNumber = '966501234567'; // رقم الواتساب
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            اختر باقتك واطلب الآن
          </h2>
          <p className="font-cairo text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            أسعار واضحة وشفافة - اطلب عبر واتساب واحصل على تصميمك بسرعة
          </p>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 bg-white/70 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="font-cairo">تسليم سريع</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="font-cairo">ضمان الجودة</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="font-cairo">500+ عميل راضي</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in ${
                plan.popular ? 'ring-4 ring-purple-200 scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-cairo font-medium shadow-lg">
                    ⭐ الأكثر طلباً
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-cairo font-bold text-2xl text-gray-900 mb-2">
                    {plan.nameAr}
                  </h3>
                  <p className="font-cairo text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="font-cairo text-gray-400 line-through text-lg">
                      {plan.originalPrice} ريال
                    </span>
                    <span className="font-cairo font-bold text-4xl text-gray-900">
                      {plan.price} ريال
                    </span>
                  </div>
                  
                  {/* Delivery Time */}
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-cairo inline-block">
                    ⚡ تسليم خلال {plan.deliveryTime}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="font-cairo text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={() => handleWhatsAppOrder(plan.whatsappMessage)}
                  className={`w-full font-cairo text-lg py-6 bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg`}
                >
                  اطلب عبر واتساب
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
                
                {/* Additional Info */}
                <p className="text-center font-cairo text-xs text-gray-500 mt-3">
                  بدون رسوم إضافية - الدفع عند الاستلام
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            <h3 className="font-cairo font-bold text-2xl text-gray-900 mb-4">
              لديك طلب خاص أو استفسار؟
            </h3>
            <p className="font-cairo text-gray-600 mb-6 text-lg">
              تواصل معنا مباشرة عبر واتساب للحصول على عرض سعر مخصص لمشروعك
            </p>
            <Button 
              onClick={() => handleWhatsAppOrder('مرحباً، أريد الاستفسار عن خدمات التصميم')}
              size="lg"
              className="font-cairo text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              تواصل معنا عبر واتساب
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>

        {/* Guarantee Section */}
        <div className="text-center mt-12 animate-fade-in">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-cairo">ضمان استرداد المال</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-cairo">تسليم في الموعد</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-cairo">دعم مدى الحياة</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-cairo">مراجعات مجانية</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

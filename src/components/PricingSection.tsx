
import { Check, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      nameAr: 'المبتدئ',
      price: '99',
      description: 'مثالي للمشاريع الصغيرة والشركات الناشئة',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      features: [
        'تصميم شعار واحد',
        '3 مراجعات مجانية', 
        'ملفات عالية الجودة',
        'تسليم خلال 3 أيام',
        'دعم فني أساسي',
        'حقوق ملكية كاملة'
      ],
      popular: false
    },
    {
      name: 'Professional',
      nameAr: 'المحترف',
      price: '299',
      description: 'الأنسب للشركات المتوسطة والمشاريع المتقدمة',
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      features: [
        'تصميم شعار + 3 متغيرات',
        '5 مراجعات مجانية',
        'ملفات عالية الجودة',
        'تسليم خلال 2 أيام',
        'تصميم بطاقة عمل',
        'تصميم ورقة رسمية',
        'دعم فني متقدم',
        'حقوق ملكية كاملة'
      ],
      popular: true
    },
    {
      name: 'Premium',
      nameAr: 'المميز',
      price: '599',
      description: 'حل متكامل للشركات الكبيرة والهوية البصرية الكاملة',
      icon: Crown,
      color: 'from-purple-600 to-pink-600',
      features: [
        'هوية بصرية كاملة',
        'مراجعات غير محدودة',
        'جميع الملفات والصيغ',
        'تسليم خلال 24 ساعة',
        'تصميم بطاقة عمل',
        'تصميم ورقة رسمية',
        'تصميم مغلف',
        'دليل استخدام الهوية',
        'دعم VIP لمدة 3 أشهر',
        'حقوق ملكية كاملة'
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            باقات التصميم
          </h2>
          <p className="font-cairo text-lg text-gray-600 max-w-2xl mx-auto">
            اختر الباقة التي تناسب احتياجاتك ومتطلبات مشروعك
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in ${
                plan.popular ? 'ring-4 ring-purple-200 scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-cairo font-medium">
                    الأكثر طلباً
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
                  <div className="flex items-center justify-center">
                    <span className="font-cairo font-bold text-4xl text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="font-cairo text-gray-600 text-sm mr-2">
                      / مشروع
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="font-cairo text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full font-cairo text-lg py-6 bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all duration-200 transform hover:scale-105`}
                >
                  اطلب الآن
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 animate-fade-in">
          <p className="font-cairo text-gray-600 mb-4">
            جميع الباقات تشمل ضمان استرداد كامل خلال 30 يوم
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-cairo">ضمان الجودة</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-cairo">تسليم في الموعد</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-cairo">دعم 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

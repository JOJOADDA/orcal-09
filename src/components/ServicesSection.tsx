
import { Palette, Monitor, FileText, Smartphone, Globe, Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServicesSection = () => {
  const services = [
    {
      icon: Palette,
      title: 'تصميم الشعارات',
      description: 'شعارات احترافية تعكس هوية علامتك التجارية بأسلوب عصري ومميز يجذب العملاء',
      color: 'from-purple-500 to-purple-600',
      examples: ['شعار شركة', 'شعار متجر', 'شعار مطعم']
    },
    {
      icon: Smartphone,
      title: 'تصميم سوشيال ميديا',
      description: 'منشورات وقصص جذابة لجميع منصات التواصل الاجتماعي تزيد من تفاعل جمهورك',
      color: 'from-blue-500 to-blue-600',
      examples: ['منشورات انستقرام', 'ستوريز', 'غلاف فيسبوك']
    },
    {
      icon: FileText,
      title: 'المطبوعات التجارية',
      description: 'تصميم بروشورات، كتالوجات، وجميع المطبوعات التجارية بجودة عالية جاهزة للطباعة',
      color: 'from-purple-600 to-pink-600',
      examples: ['بروشورات', 'كتالوجات', 'فلايرز']
    },
    {
      icon: Monitor,
      title: 'واجهات المواقع',
      description: 'تصميم واجهات مستخدم احترافية وتجربة مستخدم مثالية للمواقع والتطبيقات',
      color: 'from-blue-600 to-cyan-600',
      examples: ['تصميم موقع', 'تطبيق جوال', 'لوحة تحكم']
    },
    {
      icon: Globe,
      title: 'الهوية البصرية',
      description: 'تطوير هوية بصرية متكاملة لعلامتك التجارية شاملة جميع العناصر التصميمية',
      color: 'from-purple-500 to-blue-500',
      examples: ['دليل الهوية', 'بطاقات عمل', 'أوراق رسمية']
    },
    {
      icon: Package,
      title: 'تصميم التغليف',
      description: 'تصاميم تغليف مبتكرة وجذابة تجعل منتجك يبرز في الأسواق ويجذب المشترين',
      color: 'from-pink-500 to-rose-600',
      examples: ['علب المنتجات', 'أكياس التسوق', 'لصاقات']
    }
  ];

  const scrollToOrder = () => {
    const orderSection = document.getElementById('pricing');
    orderSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            خدماتنا التصميمية
          </h2>
          <p className="font-cairo text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            نقدم جميع أنواع التصاميم التي تحتاجها لنجاح مشروعك أو علامتك التجارية
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 max-w-2xl mx-auto">
            <span className="font-cairo">✨ +500 تصميم منجز</span>
            <span className="font-cairo">⚡ تسليم خلال 24 ساعة</span>
            <span className="font-cairo">🎯 دقة 100%</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in border border-gray-100 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`relative w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative space-y-4">
                <h3 className="font-cairo font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                  {service.title}
                </h3>
                <p className="font-cairo text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                
                {/* Examples */}
                <div className="space-y-2">
                  <h4 className="font-cairo font-semibold text-sm text-gray-700">أمثلة على الخدمة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.examples.map((example, exIndex) => (
                      <span 
                        key={exIndex}
                        className="font-cairo text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-12 animate-fade-in">
            <h3 className="font-cairo font-bold text-3xl text-gray-900 mb-4">
              جاهز لبدء مشروعك؟
            </h3>
            <p className="font-cairo text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
              اختر الخدمة التي تحتاجها واطلبها الآن عبر واتساب
              <br />
              <span className="text-purple-600 font-semibold">بدون تسجيل - بدون تعقيدات - تسليم سريع</span>
            </p>
            <Button 
              onClick={scrollToOrder}
              size="lg"
              className="font-cairo text-xl px-12 py-8 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              اطلب تصميمك الآن
              <ArrowLeft className="w-6 h-6 mr-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

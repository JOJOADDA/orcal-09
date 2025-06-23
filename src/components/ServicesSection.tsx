
import { Palette, Monitor, FileText, Smartphone, Globe, Package } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Palette,
      title: 'تصميم الشعارات',
      description: 'شعارات احترافية تعكس هوية علامتك التجارية بتصاميم عصرية ومميزة',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Smartphone,
      title: 'تصميم سوشيال ميديا',
      description: 'تصاميم جذابة لمنصات التواصل الاجتماعي تزيد من تفاعل جمهورك',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FileText,
      title: 'المطبوعات',
      description: 'تصميم بروشورات، كتالوجات، وكل ما تحتاجه للطباعة بجودة عالية',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Monitor,
      title: 'واجهات UI/UX',
      description: 'تصميم واجهات مستخدم احترافية وتجربة مستخدم مثالية للمواقع والتطبيقات',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Globe,
      title: 'الهوية البصرية',
      description: 'تطوير هوية بصرية متكاملة لعلامتك التجارية من الألف إلى الياء',
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: Package,
      title: 'تصميم التغليف',
      description: 'تصاميم تغليف مبتكرة تجعل منتجك يبرز في الأسواق',
      color: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            خدماتنا الإبداعية
          </h2>
          <p className="font-cairo text-lg text-gray-600 max-w-2xl mx-auto">
            نقدم مجموعة شاملة من خدمات التصميم الجرافيكي لتلبية جميع احتياجاتك الإبداعية
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="font-cairo font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                  {service.title}
                </h3>
                <p className="font-cairo text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 animate-fade-in">
            <h3 className="font-cairo font-bold text-2xl text-gray-900 mb-4">
              هل لديك مشروع مخصص؟
            </h3>
            <p className="font-cairo text-gray-600 mb-6">
              تواصل معنا للحصول على استشارة مجانية وعرض سعر مخصص لمشروعك
            </p>
            <button className="font-cairo bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
              احصل على استشارة مجانية
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

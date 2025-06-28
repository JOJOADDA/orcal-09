
import { Clock, Award, Users, Heart } from 'lucide-react';

const Features = () => {
  const features = [
    { icon: Clock, title: 'تسليم سريع', desc: 'خلال 24-48 ساعة' },
    { icon: Award, title: 'جودة عالية', desc: 'تصاميم احترافية' },
    { icon: Users, title: '+500 عميل', desc: 'راضي عن خدماتنا' },
    { icon: Heart, title: 'دعم مستمر', desc: 'متابعة ما بعد التسليم' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 max-w-4xl mx-auto">
      {features.map((feature, index) => (
        <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
          <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-red-500" />
          <h3 className="font-display font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1">{feature.title}</h3>
          <p className="font-body text-xs sm:text-xs md:text-sm text-gray-600 leading-tight">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default Features;

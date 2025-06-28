
import { Clock, Award, Users, Heart, Zap, CheckCircle } from 'lucide-react';

const Features = () => {
  const features = [
    { 
      icon: Zap, 
      title: 'تسليم سريع', 
      desc: 'خلال 24-48 ساعة',
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      icon: Award, 
      title: 'جودة عالية', 
      desc: 'تصاميم احترافية',
      color: 'from-purple-400 to-pink-500'
    },
    { 
      icon: Users, 
      title: '+500 عميل', 
      desc: 'راضي عن خدماتنا',
      color: 'from-blue-400 to-cyan-500'
    },
    { 
      icon: Heart, 
      title: 'دعم مستمر', 
      desc: 'متابعة ما بعد التسليم',
      color: 'from-red-400 to-pink-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12 max-w-5xl mx-auto">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="group bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 border border-white/50"
        >
          <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}>
            <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2 group-hover:text-gray-800 transition-colors">
            {feature.title}
          </h3>
          <p className="font-body text-xs sm:text-xs md:text-sm text-gray-600 leading-tight group-hover:text-gray-700 transition-colors">
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Features;

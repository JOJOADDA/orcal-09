
import { Star } from 'lucide-react';

const Header = () => {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12">
      {/* Logo Section - Responsive sizing */}
      <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
        <img 
          src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" 
          alt="أوركال للدعاية والإعلان" 
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain"
        />
      </div>
      
      {/* Title - Responsive text sizing */}
      <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent px-2 leading-tight">
        أوركال للدعاية والإعلان
      </h1>
      
      {/* Subtitle - Responsive text */}
      <p className="font-body text-base sm:text-lg md:text-xl text-gray-700 mb-2 px-2 sm:px-4 font-medium leading-relaxed">
        نحول أفكارك إلى تصاميم إبداعية مذهلة
      </p>
      
      <p className="font-body text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4 leading-relaxed">
        خبرة تزيد عن 20 سنة في عالم الدعاية والإعلان والإنتاج الفني
      </p>
      
      {/* Stats - Mobile-optimized layout */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-8 text-xs sm:text-sm text-gray-600 bg-white/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 backdrop-blur-sm mx-auto max-w-2xl">
        <div className="flex items-center gap-1 sm:gap-2">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-display font-bold">4.9/5</span>
          <span className="font-body">تقييم العملاء</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
        <span className="font-body">+500 مشروع مكتمل</span>
        <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
        <span className="font-body">ضمان الجودة 100%</span>
      </div>
    </div>
  );
};

export default Header;

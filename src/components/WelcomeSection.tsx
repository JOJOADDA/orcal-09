
import { Button } from '@/components/ui/button';
import { ArrowDown, Star } from 'lucide-react';

const WelcomeSection = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('design-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Simple Hero */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-700 mb-4 font-arabic leading-tight">
            🎨 مرحباً بك في أوركال
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 font-arabic leading-relaxed">
            نحن نقدم خدمات التصميم الجرافيكي الاحترافية لتحويل أفكارك إلى واقع مرئي مذهل
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 mb-8 text-sm">
            <div className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-2 shadow-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-arabic">4.9/5 تقييم</span>
            </div>
            <div className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-2 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-arabic">متاح الآن</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={scrollToForm}
          size="lg" 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-arabic font-bold py-4 text-xl rounded-xl shadow-lg"
        >
          احصل على تصميمك الآن
          <ArrowDown className="w-5 h-5 mr-2 animate-bounce" />
        </Button>

        {/* Simple Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">500+</div>
            <div className="text-xs text-gray-600 font-arabic">عميل راضٍ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1000+</div>
            <div className="text-xs text-gray-600 font-arabic">تصميم منجز</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">24</div>
            <div className="text-xs text-gray-600 font-arabic">ساعة تسليم</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;


import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Star, Users, Award, Zap } from 'lucide-react';

const HeroSection = () => {
  const stats = [
    { icon: Users, number: '500+', label: 'عميل سعيد' },
    { icon: Award, number: '1000+', label: 'مشروع مكتمل' },
    { icon: Star, number: '4.9', label: 'تقييم العملاء' },
    { icon: Zap, number: '24/7', label: 'دعم فني' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-hero-gradient opacity-10"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-right space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="font-cairo font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight">
                نحول{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  أفكارك الإبداعية
                </span>
                {' '}إلى واقع
              </h1>
              <p className="font-cairo text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                منصة احترافية لخدمات التصميم الجرافيكي تقدم حلول تصميم مبتكرة وعصرية 
                للشعارات، وسائل التواصل الاجتماعي، والمطبوعات بجودة عالية وتسليم سريع
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button 
                size="lg" 
                className="font-cairo text-lg px-8 py-6 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
              >
                اطلب تصميمك الآن
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="font-cairo text-lg px-8 py-6 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Play className="w-5 h-5 ml-2" />
                شاهد معرض الأعمال
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-cairo">تقييم 4.9 من 5</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="font-cairo">أكثر من 500 عميل راضي</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="font-cairo">تسليم خلال 24 ساعة</span>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative animate-scale-in">
            <div className="relative z-10">
              {/* Main Design Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cairo font-semibold text-lg">تصميم شعار احترافي</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full"></div>
                    <div className="h-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-2/3"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-cairo">جاري التصميم...</span>
                    <span className="font-cairo">75%</span>
                  </div>
                </div>
              </div>

              {/* Secondary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3"></div>
                  <h4 className="font-cairo font-medium text-sm">تصميم سوشيال ميديا</h4>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3"></div>
                  <h4 className="font-cairo font-medium text-sm">تصميم مطبوعات</h4>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300 rounded-full opacity-80 animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-300 rounded-full opacity-80 animate-bounce delay-300"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-200">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
              <stat.icon className="w-8 h-8 text-purple-600 mx-auto" />
              <div className="font-cairo font-bold text-2xl text-gray-900">{stat.number}</div>
              <div className="font-cairo text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

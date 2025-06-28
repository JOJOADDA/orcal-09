
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Users, Award, Clock, CheckCircle } from 'lucide-react';

const HeroSection = () => {
  const benefits = [
    { icon: Clock, text: 'تسليم سريع خلال 24-48 ساعة' },
    { icon: CheckCircle, text: 'جودة احترافية مضمونة' },
    { icon: Users, text: 'أكثر من 500 عميل راضي' },
    { icon: Award, text: 'تصاميم حائزة على جوائز' },
  ];

  const scrollToOrder = () => {
    const orderSection = document.getElementById('pricing');
    orderSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPortfolio = () => {
    const portfolioSection = document.getElementById('portfolio');
    portfolioSection?.scrollIntoView({ behavior: 'smooth' });
  };

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
            <div className="space-y-6">
              <h1 className="font-cairo font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight">
                احصل على{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  تصميم احترافي
                </span>
                {' '}في دقائق
              </h1>
              <p className="font-cairo text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                اطلب تصميمك الآن واحصل عليه جاهزاً خلال 24-48 ساعة
                <br />
                <span className="text-purple-600 font-semibold">بدون تسجيل دخول - بدون تعقيدات</span>
              </p>
              
              {/* Benefits List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse bg-white/70 rounded-lg p-3">
                    <benefit.icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="font-cairo text-gray-700 text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button 
                size="lg" 
                onClick={scrollToOrder}
                className="font-cairo text-xl px-12 py-8 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
              >
                اطلب تصميمك الآن
                <ArrowLeft className="w-6 h-6 mr-3" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToPortfolio}
                className="font-cairo text-lg px-8 py-6 border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                شاهد أعمالنا السابقة
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 bg-white/50 rounded-xl p-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-cairo font-medium">4.9/5 تقييم ممتاز</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="font-cairo">500+ مشروع مكتمل</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="font-cairo">ضمان الجودة 100%</span>
            </div>
          </div>

          {/* Visual Elements */}
          <div className="relative animate-scale-in">
            <div className="relative z-10">
              {/* Main Design Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-cairo font-bold text-xl text-gray-900">تصميم شعار</h3>
                      <p className="font-cairo text-purple-600 text-sm">جاري التنفيذ...</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">DP</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full"></div>
                    <div className="h-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-cairo text-gray-600">التقدم: 85%</span>
                    <span className="font-cairo text-green-600 font-medium">سيكتمل خلال ساعات</span>
                  </div>
                </div>
              </div>

              {/* Secondary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-purple-600 font-cairo font-bold">سوشيال</span>
                  </div>
                  <h4 className="font-cairo font-semibold text-center">تصميم منشورات</h4>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-blue-600 font-cairo font-bold">طباعة</span>
                  </div>
                  <h4 className="font-cairo font-semibold text-center">تصميم مطبوعات</h4>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-300 rounded-full opacity-80 animate-bounce flex items-center justify-center">
              <span className="text-yellow-800 font-bold text-sm">جديد!</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-300 rounded-full opacity-80 animate-bounce delay-300 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-pink-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

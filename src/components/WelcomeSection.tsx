
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Award, Zap, ArrowDown, Sparkles, Palette, Heart } from 'lucide-react';

const WelcomeSection = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('design-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "جودة عالية",
      description: "تصاميم احترافية تلبي أعلى المعايير العالمية",
      color: "yellow"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "فريق متخصص",
      description: "مصممون خبراء في جميع أنواع التصميم الحديث",
      color: "blue"
    },
    {
      icon: <Award className="h-8 w-8 text-green-500" />,
      title: "خبرة متميزة",
      description: "سنوات من الخبرة في السوق السوداني والعربي",
      color: "green"
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-500" />,
      title: "سرعة في التنفيذ",
      description: "تسليم سريع وفي الوقت المحدد دون تأخير",
      color: "purple"
    }
  ];

  const stats = [
    { number: "500+", label: "عميل راضٍ", icon: "😊" },
    { number: "1000+", label: "تصميم منجز", icon: "🎨" },
    { number: "5+", label: "سنوات خبرة", icon: "⭐" },
    { number: "24", label: "ساعة تسليم", icon: "⚡" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-2000"></div>

      <div className="relative z-10 padding-responsive-lg">
        {/* Hero Section */}
        <div className="text-center spacing-responsive-lg max-w-5xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-responsive-base px-8 py-3 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <Palette className="w-5 h-5 ml-2" />
            🎨 شركة أوركال للدعاية والإعلان
            <Sparkles className="w-5 h-5 mr-2" />
          </Badge>
          
          <h1 className="text-responsive-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-8 leading-tight">
            مرحباً بك في عالم التصميم الإبداعي المتميز
          </h1>
          
          <p className="text-responsive-base text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            نحن نقدم خدمات التصميم الجرافيكي الاحترافية لتحويل أفكارك إلى واقع مرئي مذهل.
            من تصميم الشعارات إلى المواد الإعلانية المتطورة، نحن هنا لخدمتك بأعلى معايير الجودة.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="btn-mobile-friendly bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white shadow-2xl hover-lift px-12 py-6 text-xl font-bold rounded-2xl"
            >
              <Sparkles className="w-6 h-6 ml-3" />
              احصل على تصميمك الآن
              <ArrowDown className="w-6 h-6 mr-3 animate-bounce" />
            </Button>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-600">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-arabic">مجاناً استشارة التصميم</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-16 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-arabic font-medium">4.9/5 تقييم ممتاز</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-arabic">متاح الآن للخدمة</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              <span className="font-arabic">ضمان الجودة 100%</span>
              <Award className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="glass-effect hover-lift border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden group">
              <div className={`h-2 bg-gradient-to-r ${
                feature.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                feature.color === 'blue' ? 'from-blue-400 to-blue-600' :
                feature.color === 'green' ? 'from-green-400 to-green-600' :
                'from-purple-400 to-purple-600'
              }`}></div>
              <CardHeader className="text-center pb-4 pt-8">
                <div className="mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-responsive-sm font-bold text-gray-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center px-6 pb-8">
                <CardDescription className="text-responsive-xs leading-relaxed text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 font-arabic">
            إنجازاتنا بالأرقام
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-responsive-xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-responsive-sm text-gray-600 font-arabic">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 font-arabic">
            جاهز لبدء مشروعك التصميمي؟
          </h2>
          <p className="text-xl mb-8 opacity-90 font-arabic">
            انضم إلى مئات العملاء الراضين واحصل على تصميمك المتميز اليوم
          </p>
          <Button 
            onClick={scrollToForm}
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-6 px-12 rounded-2xl text-xl shadow-xl hover-lift"
          >
            <ArrowDown className="w-6 h-6 ml-3 animate-bounce" />
            ابدأ الآن - مجاناً
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;

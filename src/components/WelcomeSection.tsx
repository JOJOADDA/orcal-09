
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Award, Zap } from 'lucide-react';

const WelcomeSection = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('design-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      title: "جودة عالية",
      description: "تصاميم احترافية تلبي أعلى المعايير"
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "فريق متخصص",
      description: "مصممون خبراء في جميع أنواع التصميم"
    },
    {
      icon: <Award className="h-6 w-6 text-green-500" />,
      title: "خبرة متميزة",
      description: "سنوات من الخبرة في السوق السوداني"
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      title: "سرعة في التنفيذ",
      description: "تسليم سريع وفي الوقت المحدد"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 padding-responsive-lg">
      {/* Hero Section */}
      <div className="text-center spacing-responsive-lg">
        <Badge variant="secondary" className="mb-4 text-responsive-sm">
          🎨 شركة أوركال للدعاية والإعلان
        </Badge>
        
        <h1 className="text-responsive-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          مرحباً بك في عالم التصميم الإبداعي
        </h1>
        
        <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto mb-8">
          نحن نقدم خدمات التصميم الجرافيكي الاحترافية لتحويل أفكارك إلى واقع مرئي مذهل.
          من تصميم الشعارات إلى المواد الإعلانية، نحن هنا لخدمتك.
        </p>

        <Button 
          onClick={scrollToForm}
          size="lg" 
          className="btn-mobile-friendly bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover-lift"
        >
          احصل على تصميمك الآن
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
        {features.map((feature, index) => (
          <Card key={index} className="glass-effect hover-lift border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 p-3 rounded-full bg-white/50">
                {feature.icon}
              </div>
              <CardTitle className="text-responsive-sm">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-responsive-xs">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-12 sm:mt-16 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="space-y-2">
            <div className="text-responsive-xl font-bold text-purple-600">500+</div>
            <div className="text-responsive-sm text-gray-600">عميل راضٍ</div>
          </div>
          <div className="space-y-2">
            <div className="text-responsive-xl font-bold text-blue-600">1000+</div>
            <div className="text-responsive-sm text-gray-600">تصميم منجز</div>
          </div>
          <div className="space-y-2">
            <div className="text-responsive-xl font-bold text-green-600">5+</div>
            <div className="text-responsive-sm text-gray-600">سنوات خبرة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;


import { Users, Award, Clock, Target } from 'lucide-react';

const AboutSection = () => {
  const stats = [
    { icon: Users, number: '500+', label: 'عميل راضي' },
    { icon: Award, number: '1000+', label: 'مشروع مكتمل' },
    { icon: Clock, number: '5+', label: 'سنوات خبرة' },
    { icon: Target, number: '100%', label: 'التزام بالمواعيد' }
  ];

  const team = [
    {
      name: 'أحمد محمد',
      role: 'مدير التصميم الإبداعي',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      description: 'خبرة 8 سنوات في تصميم الهويات البصرية والشعارات'
    },
    {
      name: 'سارة أحمد',
      role: 'مصممة UI/UX',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      description: 'متخصصة في تصميم واجهات المستخدم وتجربة المستخدم'
    },
    {
      name: 'محمد علي',
      role: 'مصمم جرافيك',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      description: 'خبير في تصميم المطبوعات والمواد التسويقية'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            من نحن
          </h2>
          <p className="font-cairo text-lg text-gray-600 max-w-2xl mx-auto">
            فريق من المصممين المحترفين والمبدعين نعمل بشغف لتحويل أفكارك إلى تصاميم استثنائية
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="font-cairo font-bold text-2xl text-gray-900 mb-4">
                قصتنا
              </h3>
              <p className="font-cairo text-gray-600 leading-relaxed mb-4">
                بدأنا رحلتنا في عالم التصميم الجرافيكي بهدف واضح: تقديم حلول تصميم إبداعية ومبتكرة 
                تساعد الشركات والأفراد على التميز في السوق.
              </p>
              <p className="font-cairo text-gray-600 leading-relaxed">
                نؤمن بأن التصميم الجيد ليس مجرد شكل جميل، بل هو أداة قوية للتواصل ونقل الرسالة 
                بطريقة فعالة ومؤثرة. لذلك نركز على فهم احتياجات عملائنا بعمق لننتج تصاميم تحقق أهدافهم.
              </p>
            </div>

            <div>
              <h3 className="font-cairo font-bold text-2xl text-gray-900 mb-4">
                رؤيتنا
              </h3>
              <p className="font-cairo text-gray-600 leading-relaxed">
                أن نكون المنصة الرائدة في المنطقة لخدمات التصميم الجرافيكي، ونساهم في نجاح 
                عملائنا من خلال تقديم تصاميم عالية الجودة تعكس هويتهم وتحقق أهدافهم التجارية.
              </p>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative animate-scale-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-cairo font-bold text-lg">جودة مضمونة</h4>
                    <p className="font-cairo text-gray-600 text-sm">التزام تام بمعايير الجودة العالمية</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-cairo font-bold text-lg">تسليم سريع</h4>
                    <p className="font-cairo text-gray-600 text-sm">نلتزم بالمواعيد المحددة دون تأخير</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-cairo font-bold text-lg">إبداع مستمر</h4>
                    <p className="font-cairo text-gray-600 text-sm">نواكب أحدث اتجاهات التصميم</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center bg-white rounded-2xl p-6 shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <stat.icon className="w-8 h-8 text-purple-600 mx-auto mb-4" />
              <div className="font-cairo font-bold text-3xl text-gray-900 mb-2">{stat.number}</div>
              <div className="font-cairo text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Team */}
        <div>
          <h3 className="font-cairo font-bold text-2xl text-center text-gray-900 mb-12">
            فريق العمل
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in text-center"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4"></div>
                <h4 className="font-cairo font-bold text-xl text-gray-900 mb-2">{member.name}</h4>
                <p className="font-cairo text-purple-600 mb-3">{member.role}</p>
                <p className="font-cairo text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

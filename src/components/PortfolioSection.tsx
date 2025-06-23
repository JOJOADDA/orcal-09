
import { useState } from 'react';
import { Eye, Heart, Share } from 'lucide-react';

const PortfolioSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'جميع الأعمال' },
    { id: 'logos', name: 'الشعارات' },
    { id: 'social', name: 'سوشيال ميديا' },
    { id: 'print', name: 'المطبوعات' },
    { id: 'ui', name: 'واجهات UI/UX' }
  ];

  const portfolioItems = [
    {
      id: 1,
      title: 'شعار شركة تقنية',
      category: 'logos',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      client: 'TechCorp',
      likes: 124
    },
    {
      id: 2,
      title: 'تصميم تطبيق جوال',
      category: 'ui',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      client: 'MobileApp Co.',
      likes: 89
    },
    {
      id: 3,
      title: 'حملة سوشيال ميديا',
      category: 'social',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      client: 'Fashion Brand',
      likes: 156
    },
    {
      id: 4,
      title: 'كتالوج منتجات',
      category: 'print',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      client: 'Retail Store',
      likes: 73
    },
    {
      id: 5,
      title: 'هوية بصرية متكاملة',
      category: 'logos',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      client: 'Restaurant Chain',
      likes: 198
    },
    {
      id: 6,
      title: 'تصميم موقع إلكتروني',
      category: 'ui',
      image: '/lovable-uploads/5a48b336-52a6-4b3a-9fa4-01969991d8cc.png',
      client: 'E-commerce Site',
      likes: 142
    }
  ];

  const filteredItems = activeCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            معرض أعمالنا
          </h2>
          <p className="font-cairo text-lg text-gray-600 max-w-2xl mx-auto">
            تصفح مجموعة من أفضل التصاميم التي أنجزناها لعملائنا عبر مختلف المجالات
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`font-cairo px-6 py-3 rounded-xl transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                          <Share className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-white text-sm font-cairo">
                        {item.likes} إعجاب
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-cairo font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {item.title}
                </h3>
                <p className="font-cairo text-gray-600 text-sm">
                  العميل: {item.client}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="font-cairo bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
            عرض المزيد من الأعمال
          </button>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;

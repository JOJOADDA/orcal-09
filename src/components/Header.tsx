
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Mail } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'خدماتنا', href: '#services' },
    { label: 'الأسعار', href: '#pricing' },
    { label: 'معرض الأعمال', href: '#portfolio' },
    { label: 'تواصل معنا', href: '#contact' },
  ];

  const scrollToOrder = () => {
    const orderSection = document.getElementById('pricing');
    orderSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DP</span>
            </div>
            <span className="font-cairo font-bold text-xl text-gray-900">DesignPro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-cairo text-gray-700 hover:text-purple-600 transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-600 text-sm">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Phone className="w-4 h-4" />
                <span className="font-cairo">+966 50 123 4567</span>
              </div>
            </div>
            <Button 
              onClick={scrollToOrder}
              className="font-cairo bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 px-6"
            >
              اطلب تصميمك الآن
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="font-cairo text-gray-700 hover:text-purple-600 transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => {
                    scrollToOrder();
                    setIsMenuOpen(false);
                  }}
                  className="w-full font-cairo bg-gradient-to-r from-purple-500 to-blue-600"
                >
                  اطلب تصميمك الآن
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

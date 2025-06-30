
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Palette } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  onDesignerClick?: () => void;
}

const Header = ({ onLoginClick, onDesignerClick }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
              alt="أوركال" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold text-gray-900">أوركال</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <a href="#services" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              الخدمات
            </a>
            <a href="#portfolio" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              معرض الأعمال
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              الأسعار
            </a>
            <a href="#about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              من نحن
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {onDesignerClick && (
              <Button
                variant="outline"
                onClick={onDesignerClick}
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Palette className="w-4 h-4 ml-2" />
                دخول المصممين
              </Button>
            )}
            <Button 
              onClick={onLoginClick}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6"
            >
              <User className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a
                href="#services"
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                الخدمات
              </a>
              <a
                href="#portfolio"
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                معرض الأعمال
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                الأسعار
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                من نحن
              </a>
              <div className="flex flex-col gap-2 px-3 py-2">
                {onDesignerClick && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onDesignerClick();
                      setIsOpen(false);
                    }}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 w-full"
                  >
                    <Palette className="w-4 h-4 ml-2" />
                    دخول المصممين
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    onLoginClick();
                    setIsOpen(false);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full"
                >
                  <User className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

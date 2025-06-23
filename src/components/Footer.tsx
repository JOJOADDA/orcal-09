
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', name: 'Facebook' },
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Instagram, href: '#', name: 'Instagram' },
    { icon: Linkedin, href: '#', name: 'LinkedIn' }
  ];

  const quickLinks = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'الباقات', href: '#pricing' },
    { name: 'معرض الأعمال', href: '#portfolio' },
    { name: 'من نحن', href: '#about' }
  ];

  const services = [
    'تصميم الشعارات',
    'سوشيال ميديا',
    'المطبوعات',
    'واجهات UI/UX',
    'الهوية البصرية',
    'تصميم التغليف'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">DP</span>
              </div>
              <span className="font-cairo font-bold text-xl">DesignPro</span>
            </div>
            <p className="font-cairo text-gray-300 leading-relaxed">
              منصة احترافية لخدمات التصميم الجرافيكي نقدم حلول إبداعية ومبتكرة 
              لجميع احتياجاتك التصميمية بجودة عالية وأسعار تنافسية.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-cairo font-bold text-lg mb-6">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="font-cairo text-gray-300 hover:text-purple-400 transition-colors duration-200 hover:mr-2"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-cairo font-bold text-lg mb-6">خدماتنا</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="font-cairo text-gray-300">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-cairo font-bold text-lg mb-6">تواصل معنا</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-purple-400" />
                </div>
                <span className="font-cairo text-gray-300">+966 50 123 4567</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <span className="font-cairo text-gray-300">info@designpro.com</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-400" />
                </div>
                <span className="font-cairo text-gray-300">الرياض، المملكة العربية السعودية</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="font-cairo font-semibold mb-3">اشترك في النشرة الإخبارية</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-r-lg focus:outline-none focus:border-purple-500 font-cairo text-sm"
                />
                <button className="bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-2 rounded-l-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="font-cairo text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 DesignPro. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <a href="#" className="font-cairo text-gray-400 hover:text-purple-400 text-sm transition-colors">
                سياسة الخصوصية
              </a>
              <a href="#" className="font-cairo text-gray-400 hover:text-purple-400 text-sm transition-colors">
                شروط الاستخدام
              </a>
              <a href="#" className="font-cairo text-gray-400 hover:text-purple-400 text-sm transition-colors">
                اتفاقية الخدمة
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


const Footer = () => {
  return (
    <div className="text-center mt-8 sm:mt-12 md:mt-16">
      <div className="bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm mx-auto max-w-4xl">
        <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-gray-900 mb-2 sm:mb-3 md:mb-4">
          أوركال للدعاية والإعلان والإنتاج الفني
        </h3>
        <p className="font-body text-gray-700 mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base px-2 leading-relaxed">
          نحن نؤمن بأن كل علامة تجارية تستحق هوية بصرية مميزة تعكس شخصيتها وتجذب جمهورها
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
          <span className="font-body">📧 info@orcal.com</span>
          <span className="font-body">📱 0112596876</span>
          <span className="font-body">🌐 www.orcal.com</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;

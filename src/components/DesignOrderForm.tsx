
import Header from './design-order/Header';
import Features from './design-order/Features';
import CompanyInfo from './design-order/CompanyInfo';
import OrderForm from './design-order/OrderForm';
import Footer from './design-order/Footer';

const DesignOrderForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 font-arabic">
      {/* Mobile-first responsive container with proper centering */}
      <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header Section - Optimized for mobile centering */}
        <Header />
        <Features />

        {/* Main Content - Mobile-first responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-start max-w-7xl mx-auto">
          
          {/* Company Info - Mobile-first order */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 order-2 lg:order-1">
            <CompanyInfo />
          </div>

          {/* Order Form - Mobile-first sticky behavior */}
          <div className="order-1 lg:order-2">
            <OrderForm />
          </div>
        </div>

        {/* Bottom Section - Mobile-optimized */}
        <Footer />
      </div>
    </div>
  );
};

export default DesignOrderForm;

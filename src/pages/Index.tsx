
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import PricingSection from '@/components/PricingSection';
import PortfolioSection from '@/components/PortfolioSection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen font-cairo">
      <Header />
      <HeroSection />
      <ServicesSection />
      <PricingSection />
      <PortfolioSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;

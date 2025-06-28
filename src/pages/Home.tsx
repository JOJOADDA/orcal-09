
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import AboutSection from '@/components/AboutSection';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/chat';

interface HomeProps {
  user?: User | null;
  onDashboardClick?: () => void;
}

const Home = ({ user, onDashboardClick }: HomeProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Header user={user} onDashboardClick={onDashboardClick} />
      <HeroSection onDashboardClick={onDashboardClick} />
      <ServicesSection />
      <PortfolioSection />
      <AboutSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Home;

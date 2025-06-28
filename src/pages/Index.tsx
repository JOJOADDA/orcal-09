
import DesignOrderForm from '@/components/DesignOrderForm';
import WelcomeSection from '@/components/WelcomeSection';

const Index = () => {
  return (
    <div className="min-h-screen font-arabic">
      <WelcomeSection />
      <div id="design-form">
        <DesignOrderForm />
      </div>
    </div>
  );
};

export default Index;

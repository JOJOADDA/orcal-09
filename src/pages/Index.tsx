
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/LoadingScreen';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import PortfolioSection from '@/components/PortfolioSection';
import PricingSection from '@/components/PricingSection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import DesignerDashboard from '@/components/DesignerDashboard';
import DesignerAccessDialog from '@/components/DesignerAccessDialog';
import { useDesignerAccess } from '@/hooks/useDesignerAccess';

const Index = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const {
    isDesignerAuthenticated,
    showDesignerAccess,
    setShowDesignerAccess,
    handleDesignerAccess,
    handleDesignerLogout
  } = useDesignerAccess();

  // تهيئة المستخدم
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await supabaseService.getCurrentSession();
        if (session?.user) {
          setUser(session.user);
          const profile = await supabaseService.getProfile(session.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (userData: any) => {
    setUser(userData.user);
    setUserProfile(userData.profile);
    setShowAuth(false);
    
    toast({
      title: "تم تسجيل الدخول بنجاح!",
      description: `مرحباً ${userData.profile?.name || 'بك'}، يمكنك الآن إدارة المشاريع`
    });
  };

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      setUser(null);
      setUserProfile(null);
      
      toast({
        title: "تم تسجيل الخروج",
        description: "شكراً لاستخدام منصة أوركال"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // عرض لوحة تحكم المصممين
  if (isDesignerAuthenticated) {
    return <DesignerDashboard onLogout={handleDesignerLogout} />;
  }

  // عرض حوار دخول المصممين
  if (showDesignerAccess) {
    return (
      <DesignerAccessDialog
        onClose={() => setShowDesignerAccess(false)}
        onAccessGranted={handleDesignerAccess}
      />
    );
  }

  // عرض صفحة تسجيل الدخول للعملاء والإدارة
  if (showAuth) {
    return (
      <AuthPage 
        onLogin={handleLogin}
      />
    );
  }

  // عرض لوحات التحكم للمستخدمين المسجلين
  if (user && userProfile) {
    if (userProfile.role === 'admin') {
      return <AdminDashboard user={user} profile={userProfile} onLogout={handleLogout} />;
    } else {
      return <ClientDashboard user={user} profile={userProfile} onLogout={handleLogout} />;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onLoginClick={() => setShowAuth(true)}
        onDesignerClick={() => setShowDesignerAccess(true)}
      />
      <HeroSection />
      <ServicesSection />
      <PortfolioSection />
      <PricingSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;

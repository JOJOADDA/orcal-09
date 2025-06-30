
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import DesignerDashboard from '@/components/DesignerDashboard';
import DesignerAuthDialog from '@/components/DesignerAuthDialog';
import DesignerLoginButton from '@/components/DesignerLoginButton';
import { useAuthState } from '@/hooks/useAuthState';
import { useDesignerAuth } from '@/hooks/useDesignerAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const Index = () => {
  const {
    currentUser,
    isAuthenticated,
    isInitializing,
    handleAuthSuccess,
    handleLogout
  } = useAuthState();

  const {
    designerUser,
    isDesignerAuthenticated,
    showDesignerAuth,
    isLoading: isDesignerLoading,
    setShowDesignerAuth,
    handleDesignerSignIn,
    handleDesignerSignUp,
    handleDesignerLogout
  } = useDesignerAuth();

  const [forceRender, setForceRender] = useState(false);

  // تقليل وقت انتظار force render إلى ثانيتين فقط
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isInitializing) {
        console.warn('Forcing render due to initialization timeout');
        setForceRender(true);
      }
    }, 2000); // تقليل من 3 إلى 2 ثانية

    return () => clearTimeout(timeout);
  }, [isInitializing]);

  // عرض شاشة تحميل مبسطة ولفترة قصيرة فقط
  if (isInitializing && !forceRender) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الموقع...</p>
        </div>
      </div>
    );
  }

  // Show designer dashboard immediately if designer is authenticated
  if (isDesignerAuthenticated && designerUser) {
    return <DesignerDashboard designerData={designerUser} onLogout={handleDesignerLogout} />;
  }

  // Show designer auth dialog
  if (showDesignerAuth) {
    return (
      <DesignerAuthDialog
        onClose={() => setShowDesignerAuth(false)}
        onDesignerSignIn={handleDesignerSignIn}
        onDesignerSignUp={handleDesignerSignUp}
      />
    );
  }

  // Render appropriate dashboard based on auth state and user role
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="relative">
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        <DesignerLoginButton onShowDesignerAuth={() => setShowDesignerAuth(true)} />
      </div>
    );
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <ClientDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;

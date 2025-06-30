
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import DesignerDashboard from '@/components/DesignerDashboard';
import DesignerAuthDialog from '@/components/DesignerAuthDialog';
import LoadingScreen from '@/components/LoadingScreen';
import DesignerLoginButton from '@/components/DesignerLoginButton';
import { useAuthState } from '@/hooks/useAuthState';
import { useDesignerAuth } from '@/hooks/useDesignerAuth';

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
    setShowDesignerAuth,
    handleDesignerLogin,
    handleDesignerLogout
  } = useDesignerAuth();

  // Loading state during initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Show designer dashboard if designer is authenticated
  if (isDesignerAuthenticated && designerUser) {
    return <DesignerDashboard designerData={designerUser} onLogout={handleDesignerLogout} />;
  }

  // Show designer auth dialog
  if (showDesignerAuth) {
    return (
      <DesignerAuthDialog
        onClose={() => setShowDesignerAuth(false)}
        onDesignerLogin={handleDesignerLogin}
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

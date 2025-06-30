
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import DesignerDashboard from '@/components/DesignerDashboard';
import DesignerAuthDialog from '@/components/DesignerAuthDialog';
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
    isLoading: isDesignerLoading,
    setShowDesignerAuth,
    handleDesignerSignIn,
    handleDesignerSignUp,
    handleDesignerLogout
  } = useDesignerAuth();

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

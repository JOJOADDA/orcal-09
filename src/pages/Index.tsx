
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import DesignerDashboard from '@/components/DesignerDashboard';
import DesignerAuthDialog from '@/components/DesignerAuthDialog';
import DesignerLoginButton from '@/components/DesignerLoginButton';
import { useAuthState } from '@/hooks/useAuthState';
import { useDesignerAuth } from '@/hooks/useDesignerAuth';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Show loading skeleton only during initial authentication check
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center">
            <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-full" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
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

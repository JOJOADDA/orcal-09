
import { Suspense, lazy } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import LoadingScreen from '@/components/LoadingScreen';
import DesignerLoginButton from '@/components/DesignerLoginButton';
import DesignerAuthDialog from '@/components/DesignerAuthDialog';
import { useDesignerAuth } from '@/hooks/useDesignerAuth';

// تحميل كسول للمكونات الكبيرة
const FastAuthPage = lazy(() => import('@/components/FastAuthPage'));
const ClientDashboard = lazy(() => import('@/components/ClientDashboard'));
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));
const DesignerDashboard = lazy(() => import('@/components/DesignerDashboard'));

const FastIndex = () => {
  const { currentUser, isAuthenticated, isInitializing } = useOptimizedAuth();
  const {
    designerUser,
    isDesignerAuthenticated,
    showDesignerAuth,
    setShowDesignerAuth,
    handleDesignerLogin,
    handleDesignerLogout
  } = useDesignerAuth();

  // شاشة التحميل أثناء التهيئة
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // عرض لوحة تحكم المصمم إذا كان مصادق عليه
  if (isDesignerAuthenticated && designerUser) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <DesignerDashboard designerData={designerUser} onLogout={handleDesignerLogout} />
      </Suspense>
    );
  }

  // عرض نافذة مصادقة المصمم
  if (showDesignerAuth) {
    return (
      <DesignerAuthDialog
        onClose={() => setShowDesignerAuth(false)}
        onDesignerLogin={handleDesignerLogin}
      />
    );
  }

  // عرض صفحة المصادقة إذا لم يكن المستخدم مصادق عليه
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="relative">
        <Suspense fallback={<LoadingScreen />}>
          <FastAuthPage onAuthSuccess={() => window.location.reload()} />
        </Suspense>
        <DesignerLoginButton onShowDesignerAuth={() => setShowDesignerAuth(true)} />
      </div>
    );
  }

  // عرض لوحة التحكم المناسبة حسب نوع المستخدم
  return (
    <div className="relative">
      <Suspense fallback={<LoadingScreen />}>
        {currentUser.role === 'admin' ? (
          <AdminDashboard user={currentUser} onLogout={() => window.location.reload()} />
        ) : currentUser.role === 'designer' ? (
          <DesignerDashboard designerData={currentUser} onLogout={() => window.location.reload()} />
        ) : (
          <ClientDashboard user={currentUser} onLogout={() => window.location.reload()} />
        )}
      </Suspense>
      <DesignerLoginButton onShowDesignerAuth={() => setShowDesignerAuth(true)} />
    </div>
  );
};

export default FastIndex;

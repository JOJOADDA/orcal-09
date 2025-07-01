
import { Suspense, lazy } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import LoadingScreen from '@/components/LoadingScreen';

// تحميل كسول للمكونات الكبيرة
const FastAuthPage = lazy(() => import('@/components/FastAuthPage'));
const ClientDashboard = lazy(() => import('@/components/ClientDashboard'));
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));
const DesignerDashboard = lazy(() => import('@/components/DesignerDashboard'));

const FastIndex = () => {
  const { currentUser, isAuthenticated, isInitializing } = useOptimizedAuth();

  // شاشة التحميل أثناء التهيئة
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // عرض صفحة المصادقة إذا لم يكن المستخدم مصادق عليه
  if (!isAuthenticated || !currentUser) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <FastAuthPage onAuthSuccess={() => window.location.reload()} />
      </Suspense>
    );
  }

  // عرض لوحة التحكم المناسبة حسب نوع المستخدم
  return (
    <Suspense fallback={<LoadingScreen />}>
      {currentUser.role === 'admin' ? (
        <AdminDashboard user={currentUser} onLogout={() => window.location.reload()} />
      ) : currentUser.role === 'designer' ? (
        <DesignerDashboard designerData={currentUser} onLogout={() => window.location.reload()} />
      ) : (
        <ClientDashboard user={currentUser} onLogout={() => window.location.reload()} />
      )}
    </Suspense>
  );
};

export default FastIndex;

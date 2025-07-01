
import { Suspense, lazy } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import LoadingScreen from '@/components/LoadingScreen';
import DesignerLoginButton from '@/components/DesignerLoginButton';
import DesignerAuthDialog from '@/components/DesignerAuthDialog';
import { useDesignerAuth } from '@/hooks/useDesignerAuth';
import { useToast } from '@/hooks/use-toast';

// تحميل كسول للمكونات الكبيرة
const FastAuthPage = lazy(() => import('@/components/FastAuthPage'));
const ClientDashboard = lazy(() => import('@/components/ClientDashboard'));
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));
const DesignerDashboard = lazy(() => import('@/components/DesignerDashboard'));

const FastIndex = () => {
  const { currentUser, isAuthenticated, isInitializing } = useOptimizedAuth();
  const { isValidRole, roleError, isClient, isDesigner, isAdmin } = useRoleValidation({ user: currentUser });
  const { toast } = useToast();
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

  // التحقق من صحة الدور
  if (!isValidRole) {
    if (roleError) {
      toast({
        title: "خطأ في صحة المستخدم",
        description: roleError,
        variant: "destructive"
      });
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في التحقق من المستخدم</h2>
          <p className="text-red-500 mb-4">{roleError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // وظيفة تسجيل الخروج المحسنة
  const handleLogout = async () => {
    try {
      await handleDesignerLogout(); // تسجيل خروج المصمم أولاً
      window.location.reload(); // إعادة تحميل الصفحة لإعادة تعيين الحالة
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.reload(); // إعادة تحميل في حالة الخطأ أيضاً
    }
  };

  // عرض لوحة التحكم المناسبة حسب نوع المستخدم
  return (
    <div className="relative">
      <Suspense fallback={<LoadingScreen />}>
        {isAdmin ? (
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
        ) : isDesigner ? (
          <DesignerDashboard designerData={currentUser} onLogout={handleLogout} />
        ) : isClient ? (
          <ClientDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600">نوع مستخدم غير معروف</p>
          </div>
        )}
      </Suspense>
      {!isDesigner && <DesignerLoginButton onShowDesignerAuth={() => setShowDesignerAuth(true)} />}
    </div>
  );
};

export default FastIndex;


import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // تحسين سرعة التحميل - فحص حالة المصادقة بشكل أسرع
    initializeAuth();
    
    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          try {
            const profile = await supabaseService.getProfile(session.user.id);
            if (profile) {
              setCurrentUser(profile);
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      const session = await supabaseService.getCurrentSession();
      if (session?.user) {
        const profile = await supabaseService.getProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    const session = await supabaseService.getCurrentSession();
    if (session?.user) {
      const profile = await supabaseService.getProfile(session.user.id);
      if (profile) {
        setCurrentUser(profile);
        setIsAuthenticated(true);
      }
    }
  };

  const handleLogout = async () => {
    await supabaseService.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // تحسين شاشة التحميل - أبسط وأسرع
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/b49e08ca-b8a4-4464-9301-2cac70b76214.png" 
            alt="أوركال للدعاية والإعلان" 
            className="w-20 h-20 mx-auto mb-6 object-contain"
          />
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">أوركال للدعاية والإعلان</p>
          <p className="text-gray-500 text-sm mt-2">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <ClientDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;

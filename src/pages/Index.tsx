
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
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
      }
    );

    // فحص الجلسة الحالية
    const checkCurrentSession = async () => {
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
        console.error('Error checking session:', error);
      }
    };

    checkCurrentSession();

    return () => subscription.unsubscribe();
  }, []);

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

  if (!isAuthenticated || !currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <ClientDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;

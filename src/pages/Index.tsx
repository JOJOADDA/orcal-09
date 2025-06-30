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
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

  // ✅ إلغاء شاشة التحميل بالكامل بدون كسر المنطق
  if (isLoading) return null;

  if (!isAuthenticated || !currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <ClientDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;

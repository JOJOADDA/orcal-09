
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
    // Check authentication state
    checkAuthState();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await supabaseService.getProfile(session.user.id);
          setCurrentUser(profile);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    const session = await supabaseService.getCurrentSession();
    if (session?.user) {
      const profile = await supabaseService.getProfile(session.user.id);
      setCurrentUser(profile);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const handleAuthSuccess = async () => {
    const session = await supabaseService.getCurrentSession();
    if (session?.user) {
      const profile = await supabaseService.getProfile(session.user.id);
      setCurrentUser(profile);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await supabaseService.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/65aa4b7b-e60a-4160-bf45-4c057f62c70a.png" 
            alt="أوركال" 
            className="w-16 h-16 mx-auto mb-4 object-contain animate-pulse"
          />
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
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

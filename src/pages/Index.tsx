
import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Memoized callback for handling auth state changes
  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    console.log('Auth state changed:', event, session?.user?.id);
    
    if (session?.user) {
      try {
        const profile = await supabaseService.getProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          setRetryCount(0); // Reset retry count on success
        } else {
          console.warn('Profile not found for user:', session.user.id);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Retry logic for profile fetching
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            handleAuthStateChange(event, session);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setRetryCount(0);
    }
    
    setIsInitializing(false);
  }, [retryCount, maxRetries]);

  // Initial setup and auth listener
  useEffect(() => {
    let isSubscribed = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isSubscribed) {
          handleAuthStateChange(event, session);
        }
      }
    );

    // Check for existing session with timeout
    const checkCurrentSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const sessionPromise = supabaseService.getCurrentSession();
        
        const session = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (isSubscribed && session?.user) {
          const profile = await supabaseService.getProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Continue without session if there's an error
      } finally {
        if (isSubscribed) {
          setIsInitializing(false);
        }
      }
    };

    checkCurrentSession();

    // Cleanup function
    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // Optimized auth success handler
  const handleAuthSuccess = useCallback(async () => {
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
      console.error('Error in auth success handler:', error);
    }
  }, []);

  // Optimized logout handler
  const handleLogout = useCallback(async () => {
    try {
      await supabaseService.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
      supabaseService.clearAllCache();
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on auth state and user role
  if (!isAuthenticated || !currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <ClientDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;

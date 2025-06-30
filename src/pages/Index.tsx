import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import AuthPage from '@/components/AuthPage';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import DesignerDashboard from '@/components/DesignerDashboard';
import DesignerAuthDialog from '@/components/DesignerAuthDialog';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [designerUser, setDesignerUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDesignerAuthenticated, setIsDesignerAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showDesignerAuth, setShowDesignerAuth] = useState(false);
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

  // Designer authentication handlers
  const handleDesignerLogin = useCallback(async (designerData: { name: string; role: string; email: string }) => {
    setDesignerUser(designerData);
    setIsDesignerAuthenticated(true);
    setShowDesignerAuth(false);
  }, []);

  const handleDesignerLogout = useCallback(async () => {
    try {
      await supabaseService.signOut();
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
    } catch (error) {
      console.error('Error during designer logout:', error);
      // Force logout even if there's an error
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
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

  // Show designer dashboard if designer is authenticated
  if (isDesignerAuthenticated && designerUser) {
    return <DesignerDashboard user={designerUser} onLogout={handleDesignerLogout} />;
  }

  // Show designer auth dialog
  if (showDesignerAuth) {
    return (
      <DesignerAuthDialog
        onClose={() => setShowDesignerAuth(false)}
        onDesignerLogin={handleDesignerLogin}
      />
    );
  }

  // Render appropriate dashboard based on auth state and user role
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="relative">
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        
        {/* Designer Login Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowDesignerAuth(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4"
            size="lg"
          >
            <Palette className="w-6 h-6 mr-2" />
            دخول المصممين
          </Button>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <ClientDashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;

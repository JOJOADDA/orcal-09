
import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Optimized auth state change handler
  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    console.log('Auth state changed:', event, session?.user?.id);
    
    if (session?.user) {
      try {
        // Show immediate feedback
        setIsAuthenticated(true);
        
        const profile = await supabaseService.getProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
        } else {
          console.warn('Profile not found for user:', session.user.id);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    
    setIsInitializing(false);
  }, []);

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

    // Check for existing session immediately
    const checkCurrentSession = async () => {
      try {
        const session = await supabaseService.getCurrentSession();
        
        if (isSubscribed && session?.user) {
          setIsAuthenticated(true);
          const profile = await supabaseService.getProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
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
        setIsAuthenticated(true);
        const profile = await supabaseService.getProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
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

  return {
    currentUser,
    isAuthenticated,
    isInitializing,
    handleAuthSuccess,
    handleLogout
  };
};

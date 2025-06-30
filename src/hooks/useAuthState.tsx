
import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Profile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    console.log('Auth state changed:', event, session?.user?.id);
    
    try {
      if (session?.user) {
        let profile = await supabaseService.getProfile(session.user.id);
        
        // إذا لم يكن هناك profile، قم بإنشاء واحد
        if (!profile) {
          console.log('No profile found, creating one...');
          const userData = session.user.user_metadata || {};
          const { data: newProfile } = await supabaseService.createProfile(
            session.user.id,
            userData.name || 'مستخدم جديد',
            session.user.email || '',
            userData.phone || '',
            userData.role || 'client'
          );
          profile = newProfile;
        }
        
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          console.log('User authenticated successfully:', profile.name);
        } else {
          console.error('Failed to get or create user profile');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      // تأكد من إيقاف التحميل الأولي في جميع الحالات
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    let timeoutId: NodeJS.Timeout;

    // إضافة timeout للتأكد من عدم التعليق في حالة التحميل
    const initializationTimeout = setTimeout(() => {
      if (isSubscribed) {
        console.warn('Authentication initialization timeout');
        setIsInitializing(false);
      }
    }, 5000); // 5 ثوان timeout

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isSubscribed) {
          clearTimeout(initializationTimeout);
          handleAuthStateChange(event, session);
        }
      }
    );

    const checkCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isSubscribed) {
            setIsInitializing(false);
          }
          return;
        }

        if (isSubscribed) {
          clearTimeout(initializationTimeout);
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isSubscribed) {
          setIsInitializing(false);
        }
      }
    };

    checkCurrentSession();

    return () => {
      isSubscribed = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const handleAuthSuccess = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleAuthStateChange('AUTH_SUCCESS', session);
      }
    } catch (error) {
      console.error('Error in auth success handler:', error);
    }
  }, [handleAuthStateChange]);

  const handleLogout = useCallback(async () => {
    try {
      await supabaseService.signOut();
      setCurrentUser(null);
      setIsAuthenticated(false);
      supabaseService.clearAllCache();
    } catch (error) {
      console.error('Error during logout:', error);
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

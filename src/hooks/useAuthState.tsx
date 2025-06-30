
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
        // محاولة الحصول على الملف الشخصي
        let profile = await supabaseService.getProfile(session.user.id);
        
        // إذا لم يكن هناك profile، انتظر قليلاً ثم حاول مرة أخرى
        if (!profile) {
          console.log('Profile not found, waiting and retrying...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          profile = await supabaseService.getProfile(session.user.id);
        }
        
        // إذا لم يزل غير موجود، قم بإنشاء واحد
        if (!profile) {
          console.log('Creating profile for user:', session.user.id);
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
        console.log('No session found, user not authenticated');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // إعداد مهلة زمنية للتأكد من عدم التعليق
    const initTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Authentication initialization timeout');
        setIsInitializing(false);
      }
    }, 8000);

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isMounted) {
          clearTimeout(initTimeout);
          handleAuthStateChange(event, session);
        }
      }
    );

    // التحقق من الجلسة الحالية
    const checkCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setIsInitializing(false);
          }
          return;
        }

        if (isMounted) {
          clearTimeout(initTimeout);
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    checkCurrentSession();

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
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
      console.log('User logged out successfully');
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

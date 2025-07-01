
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { EnhancedAuthService } from '@/services/auth/enhancedAuthService';

export const useOptimizedAuth = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // تحسين معالج تغيير حالة المصادقة
  const handleAuthStateChange = useCallback((event: string, session: any) => {
    if (session?.user) {
      // جلب بيانات المستخدم من قاعدة البيانات بشكل غير متزامن
      const fetchUserProfile = async () => {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileData && !error) {
            setCurrentUser(profileData);
            setIsAuthenticated(true);
          } else {
            // إذا لم توجد بيانات في قاعدة البيانات، نستخدم البيانات الأساسية
            const fallbackProfile: Profile = {
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'مستخدم',
              phone: '',
              role: 'client',
              avatar_url: null,
              created_at: session.user.created_at,
              updated_at: session.user.created_at
            };
            setCurrentUser(fallbackProfile);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      };
      
      fetchUserProfile();
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    
    setIsInitializing(false);
  }, []);

  // تهيئة محسنة للمصادقة
  useEffect(() => {
    let mounted = true;

    // إعداد مستمع تغيير حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // فحص الجلسة الحالية مع timeout قصير
    const checkSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (mounted) {
          handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.log('Session check timeout, continuing...');
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // تسجيل دخول محسن
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await EnhancedAuthService.signInClient(email, password);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل تسجيل الدخول' };
    }
  }, []);

  // تسجيل خروج محسن
  const signOut = useCallback(async () => {
    try {
      const result = await EnhancedAuthService.signOut();
      if (result.success) {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  return {
    currentUser,
    isAuthenticated,
    isInitializing,
    signIn,
    signOut
  };
};


import { useState, useCallback, useEffect } from 'react';
import { Profile } from '@/types/database';
import { designerAuthService } from '@/services/auth/designerAuthService';
import { supabase } from '@/integrations/supabase/client';

export const useDesignerAuth = () => {
  const [designerUser, setDesignerUser] = useState<Profile | null>(null);
  const [isDesignerAuthenticated, setIsDesignerAuthenticated] = useState(false);
  const [showDesignerAuth, setShowDesignerAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing designer session on mount
  useEffect(() => {
    const checkDesignerSession = async () => {
      setIsLoading(true);
      try {
        const profile = await designerAuthService.getCurrentDesignerProfile();
        if (profile) {
          setDesignerUser(profile);
          setIsDesignerAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking designer session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDesignerSession();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Designer auth state changed:', event);
        
        if (session?.user) {
          const profile = await designerAuthService.getCurrentDesignerProfile();
          if (profile) {
            setDesignerUser(profile);
            setIsDesignerAuthenticated(true);
          } else {
            setDesignerUser(null);
            setIsDesignerAuthenticated(false);
          }
        } else {
          setDesignerUser(null);
          setIsDesignerAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Designer sign up
  const handleDesignerSignUp = useCallback(async (designerData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => {
    const { user, error } = await designerAuthService.signUpDesigner(designerData);
    return { success: !!user, error };
  }, []);

  // Designer sign in
  const handleDesignerSignIn = useCallback(async (email: string, password: string) => {
    const { user, error } = await designerAuthService.signInDesigner(email, password);
    
    if (user && !error) {
      setShowDesignerAuth(false);
      return { success: true, error: null };
    }
    
    return { success: false, error };
  }, []);

  // Designer logout
  const handleDesignerLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
    } catch (error) {
      console.error('Error during designer logout:', error);
      // Force logout even if there's an error
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
    }
  }, []);

  return {
    designerUser,
    isDesignerAuthenticated,
    showDesignerAuth,
    isLoading,
    setShowDesignerAuth,
    handleDesignerSignUp,
    handleDesignerSignIn,
    handleDesignerLogout
  };
};


import { useState, useEffect, useCallback } from 'react';
import { SecureAuthService } from '@/services/auth/secureAuthService';
import { Profile } from '@/types/database';
import { SecurityService } from '@/services/security/securityService';

export const useSecureAuth = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      const userData = await SecureAuthService.getCurrentUser();
      
      if (userData?.profile) {
        setCurrentUser(userData.profile);
        setIsAuthenticated(true);
        await SecurityService.logSecurityEvent('AUTH_SESSION_RESTORED', 'auth', userData.user.id);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthError('Failed to initialize authentication');
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Secure sign up
  const signUp = useCallback(async (userData: {
    name: string;
    phone: string;
    role?: 'client' | 'admin' | 'designer';
  }) => {
    try {
      setAuthError(null);
      const result = await SecureAuthService.signUp(userData);
      
      if (result.success) {
        await initializeAuth();
        return { success: true };
      } else {
        setAuthError(result.error || 'Registration failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Registration failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [initializeAuth]);

  // Secure sign in
  const signIn = useCallback(async (credentials: { phone: string }) => {
    try {
      setAuthError(null);
      const result = await SecureAuthService.signIn(credentials);
      
      if (result.success) {
        // For demo purposes, auto-authenticate after OTP generation
        // In production, this would require OTP verification
        setTimeout(async () => {
          await initializeAuth();
        }, 1000);
        
        return { success: true, data: result.data };
      } else {
        setAuthError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Login failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [initializeAuth]);

  // Secure sign out
  const signOut = useCallback(async () => {
    try {
      setAuthError(null);
      const result = await SecureAuthService.signOut();
      
      if (result.success) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        return { success: true };
      } else {
        setAuthError(result.error || 'Sign out failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Sign out failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Check if user has required role
  const hasRole = useCallback(async (requiredRole: string): Promise<boolean> => {
    if (!isAuthenticated || !currentUser) return false;
    
    try {
      const roleCheck = await SecurityService.checkUserRole(requiredRole);
      return roleCheck.hasRole;
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }, [isAuthenticated, currentUser]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Clear error after some time
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => setAuthError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  return {
    currentUser,
    isAuthenticated,
    isInitializing,
    authError,
    signUp,
    signIn,
    signOut,
    hasRole,
    refreshAuth: initializeAuth
  };
};

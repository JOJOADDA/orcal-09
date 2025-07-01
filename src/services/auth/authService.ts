// Enhanced auth service with security improvements
import { supabase } from '@/integrations/supabase/client';
import { SecurityUtils } from '@/utils/security';
import { SecurityService } from '@/services/security/securityService';

export class AuthService {
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting current session:', error);
        return null;
      }

      return data?.session;
    } catch (error) {
      console.error('Unexpected error getting session:', error);
      return null;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Unexpected error getting user:', error);
      return null;
    }
  }

  async signIn(phone: string) {
    try {
      const email = SecurityUtils.generateSecureEmailFromPhone(phone);
      const { data, error } = await supabase.auth.signInWithOtp({
        email
      });

      if (error) {
        console.error('Error signing in:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error signing in:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  async signUp(userData: {
    name: string;
    phone: string;
    role?: 'client' | 'admin' | 'designer';
  }): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // Enhanced validation using SecurityUtils
      const phoneValidation = SecurityUtils.validatePhoneNumber(userData.phone);
      if (!phoneValidation.isValid) {
        return { success: false, error: phoneValidation.error };
      }

      // Sanitize name input
      const sanitizedName = SecurityUtils.sanitizeHtml(userData.name.trim());
      if (!sanitizedName || sanitizedName.length < 2) {
        return { success: false, error: 'Name must be at least 2 characters long' };
      }

      // Validate role
      const role = userData.role || 'client';
      if (!SecurityUtils.isValidRole(role)) {
        return { success: false, error: 'Invalid user role' };
      }

      // Rate limiting
      if (!SecurityUtils.checkRateLimit(`signup_${userData.phone}`, 3, 15 * 60 * 1000)) {
        await SecurityService.logSecurityEvent('SIGNUP_RATE_LIMIT_EXCEEDED', 'auth', undefined, { phone: userData.phone });
        return { success: false, error: 'Too many signup attempts. Please try again later.' };
      }

      // Generate secure email from phone
      const email = SecurityUtils.generateSecureEmailFromPhone(userData.phone);
      const password = `temp_${userData.phone.replace(/\D/g, '')}_${Date.now()}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: sanitizedName,
            phone: userData.phone,
            role: role
          }
        }
      });

      if (error) {
        await SecurityService.logSecurityEvent('SIGNUP_FAILED', 'auth', undefined, { 
          phone: userData.phone, 
          error: error.message 
        });
        
        // Don't expose internal errors
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      await SecurityService.logSecurityEvent('USER_SIGNUP_SUCCESS', 'auth', data.user?.id, {
        role: role,
        phone: userData.phone
      });

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: 'Sign out failed' };
      }

      if (user) {
        await SecurityService.logSecurityEvent('USER_SIGNOUT', 'auth', user.id);
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Sign out failed' };
    }
  }

  async clearAllCache() {
    // Clear all cache
  }
}

export const authService = new AuthService();

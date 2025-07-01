
import { supabase } from '@/integrations/supabase/client';
import { SecurityUtils } from '@/utils/security';
import { SecurityService } from '@/services/security/securityService';

export class SecureAuthService {
  // Enhanced sign up with validation and rate limiting
  static async signUp(userData: {
    name: string;
    phone: string;
    role?: 'client' | 'admin' | 'designer';
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Rate limiting check
      if (!SecurityUtils.checkRateLimit(`signup_${userData.phone}`, 3, 15 * 60 * 1000)) {
        await SecurityService.logSecurityEvent('SIGNUP_RATE_LIMIT_EXCEEDED', 'auth', undefined, { phone: userData.phone });
        return { success: false, error: 'Too many signup attempts. Please try again later.' };
      }

      // Validate input data
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

      // Generate secure email from phone
      const email = SecurityUtils.generateSecureEmailFromPhone(userData.phone);
      const defaultPassword = `temp_${userData.phone.replace(/\D/g, '')}_${Date.now()}`;

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: defaultPassword,
        options: {
          data: {
            name: sanitizedName,
            phone: userData.phone,
            role: role
          }
        }
      });

      if (authError) {
        await SecurityService.logSecurityEvent('SIGNUP_FAILED', 'auth', undefined, { 
          phone: userData.phone, 
          error: authError.message 
        });
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      await SecurityService.logSecurityEvent('USER_SIGNUP_SUCCESS', 'auth', authData.user?.id, {
        role: role,
        phone: userData.phone
      });

      return { success: true, data: authData };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred during registration' };
    }
  }

  // Enhanced sign in with validation and rate limiting
  static async signIn(credentials: {
    phone: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Rate limiting check
      if (!SecurityUtils.checkRateLimit(`signin_${credentials.phone}`, 5, 15 * 60 * 1000)) {
        await SecurityService.logSecurityEvent('SIGNIN_RATE_LIMIT_EXCEEDED', 'auth', undefined, { phone: credentials.phone });
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Validate phone number
      const phoneValidation = SecurityUtils.validatePhoneNumber(credentials.phone);
      if (!phoneValidation.isValid) {
        return { success: false, error: phoneValidation.error };
      }

      // Generate email from phone for lookup
      const email = SecurityUtils.generateSecureEmailFromPhone(credentials.phone);

      // For demo purposes, we'll create a simple OTP-style login
      // In production, this would send an SMS OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`OTP Code for ${credentials.phone}: ${otpCode}`);

      await SecurityService.logSecurityEvent('SIGNIN_ATTEMPT', 'auth', undefined, { phone: credentials.phone });

      return { 
        success: true, 
        data: { 
          phone: credentials.phone,
          otpCode, // In production, don't return this
          message: 'OTP sent to your phone' 
        } 
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Secure sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
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

  // Get current user with security validation
  static async getCurrentUser(): Promise<{ user: any; profile: any; error?: string } | null> {
    try {
      const authValidation = await SecurityService.validateAuthState();
      if (!authValidation.isValid) {
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authValidation.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return null;
      }

      return { user: authValidation.user, profile };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

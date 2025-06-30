
import { supabase } from '@/integrations/supabase/client';

export class AuthService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    return error;
  }

  async signUp(identifier: string, password: string, name: string, phone: string = '') {
    try {
      const isEmail = identifier.includes('@');
      const email = isEmail ? identifier : `user${identifier.replace(/[^0-9]/g, '')}@orcal.app`;
      
      console.log('SignUp attempt:', { email, name, phone: isEmail ? phone : identifier });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone: isEmail ? phone : identifier,
            email: isEmail ? identifier : email,
            role: 'client'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('SignUp error:', error);
        return { data: null, error };
      }

      if (data.user && !isEmail) {
        // للحسابات غير البريدية، لا نحتاج انتظار تأكيد
        console.log('Phone signup successful for user:', data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('SignUp exception:', error);
      return { data: null, error: this.handleError(error, 'SignUp') };
    }
  }

  async signIn(identifier: string, password: string, type: 'email' | 'phone' = 'email') {
    try {
      let email = identifier;
      
      if (type === 'phone') {
        email = `user${identifier.replace(/[^0-9]/g, '')}@orcal.app`;
      }

      console.log('SignIn attempt:', { email, type });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('SignIn error:', error);
        return { data: null, error };
      }

      if (data.user) {
        console.log('SignIn successful for user:', data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('SignIn exception:', error);
      return { data: null, error: this.handleError(error, 'SignIn') };
    }
  }

  async signOut() {
    try {
      console.log('SignOut attempt');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('SignOut error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('SignOut exception:', error);
      return { error: this.handleError(error, 'SignOut') };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get current user error:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Get current user exception:', error);
      this.handleError(error, 'Get Current User');
      return null;
    }
  }

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get current session error:', error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Get current session exception:', error);
      this.handleError(error, 'Get Current Session');
      return null;
    }
  }

  async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Resend confirmation error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Resend confirmation exception:', error);
      return { error: this.handleError(error, 'Resend Confirmation') };
    }
  }
}

export const authService = new AuthService();

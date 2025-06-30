
import { supabase } from '@/integrations/supabase/client';

export class AuthService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

  async signUp(identifier: string, password: string, name: string, phone: string = '') {
    try {
      const isEmail = identifier.includes('@');
      const email = isEmail ? identifier : `user${identifier.replace('+', '')}@orcal.app`;
      
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

      if (data.user && !error) {
        console.log('Client signup successful for user:', data.user.id);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'SignUp') };
    }
  }

  async signIn(identifier: string, password: string, type: 'email' | 'phone' = 'email') {
    try {
      let email = identifier;
      
      if (type === 'phone') {
        email = `user${identifier.replace('+', '')}@orcal.app`;
      }

      console.log('SignIn attempt:', { email, type });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (data.user && !error) {
        console.log('SignIn successful for user:', data.user.id);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'SignIn') };
    }
  }

  async signOut() {
    try {
      console.log('SignOut attempt');
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'SignOut') };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      this.handleError(error, 'Get Current User');
      return null;
    }
  }

  async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
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
      return { error };
    } catch (error) {
      return { error: this.handleError(error, 'Resend Confirmation') };
    }
  }
}

export const authService = new AuthService();


import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

class AuthService {
  async signUp(identifier: string, password: string, name: string, phone: string = '') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: identifier,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });

      if (error) {
        return { data: null, error, success: false };
      }

      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message || 'Signup failed', success: false };
    }
  }

  async signIn(identifier: string, password: string, type: 'email' | 'phone' = 'email') {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password
      });

      if (error) {
        return { data: null, error, success: false };
      }

      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: error.message || 'Login failed', success: false };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error, success: false };
      }
      return { error: null, success: true };
    } catch (error: any) {
      return { error: error.message || 'Signout failed', success: false };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { user: null, profile: null, error };
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { user, profile, error: profileError };
    } catch (error: any) {
      return { user: null, profile: null, error: error.message };
    }
  }

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error: any) {
      return { session: null, error: error.message };
    }
  }

  async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      return { error };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

export const authService = new AuthService();

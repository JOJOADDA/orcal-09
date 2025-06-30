
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export class DesignerAuthService {
  // Sign up a new designer
  async signUpDesigner(designerData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    try {
      console.log('Signing up designer:', designerData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: designerData.email,
        password: designerData.password,
        options: {
          data: {
            name: designerData.name,
            phone: designerData.phone || '',
            role: 'designer'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Designer signup error:', error);
        return { user: null, error };
      }

      console.log('Designer signed up successfully:', data.user?.id);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Designer signup error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Sign in designer
  async signInDesigner(email: string, password: string) {
    try {
      console.log('Signing in designer:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Designer signin error:', error);
        return { user: null, error };
      }

      // Verify the user is actually a designer
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile?.role !== 'designer') {
          await supabase.auth.signOut();
          return { 
            user: null, 
            error: new Error('هذا الحساب ليس حساب مصمم') 
          };
        }
      }

      console.log('Designer signed in successfully:', data.user?.id);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Designer signin error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Get current designer profile
  async getCurrentDesignerProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'designer') {
        return profile as Profile;
      }

      return null;
    } catch (error) {
      console.error('Error getting designer profile:', error);
      return null;
    }
  }
}

export const designerAuthService = new DesignerAuthService();

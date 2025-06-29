import { supabase } from '@/integrations/supabase/client';
import { Profile, DesignOrder, OrderFile, ChatRoom, ChatMessage, MessageFile } from '@/types/database';

class SupabaseService {
  // Authentication
  async signUp(email: string, password: string, name: string, role: 'client' | 'admin' = 'client') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          email,
          role
        }
      }
    });

    if (data.user && !error) {
      try {
        await this.createProfile(data.user.id, name, email, role);
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Profile Management
  async createProfile(userId: string, name: string, email: string, role: 'client' | 'admin' = 'client') {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        email,
        role
      })
      .select()
      .single();

    return { data: data as Profile, error };
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data: data as Profile, error };
  }

  // باقي الميثودز كما هي (createOrder, getOrdersByClientId, etc.) بدون تعديل لأن تغيير الهاتف لا يؤثر فيها
}

export const supabaseService = new SupabaseService();

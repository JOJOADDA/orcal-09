import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
  async signUp(email: string, password: string, name: string, phone: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        }
      }
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
};

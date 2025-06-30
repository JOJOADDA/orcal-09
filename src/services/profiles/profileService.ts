
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { CacheService } from '../cache/cacheService';

export class ProfileService extends CacheService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

  async createProfile(userId: string, name: string, email: string, phone: string, role: 'client' | 'admin' | 'designer' = 'client') {
    try {
      console.log('Creating profile for user:', userId, { name, email, phone, role });
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name,
          phone,
          role
        })
        .select()
        .single();

      if (data && !error) {
        console.log('Profile created successfully:', data);
        this.setCache(`profile_${userId}`, data);
      }

      return { data: data as Profile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Create Profile') };
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const cacheKey = `profile_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        this.handleError(error, 'Get Profile');
        return null;
      }
      
      const profile = data as Profile;
      this.setCache(cacheKey, profile);
      console.log('Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      this.handleError(error, 'Get Profile');
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (!error) {
        this.clearCache(`profile_${userId}`);
      }

      return { data: data as Profile, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Profile') };
    }
  }
}

export const profileService = new ProfileService();

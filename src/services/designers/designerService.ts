import { supabase } from '@/integrations/supabase/client';
import { CacheService } from '../cache/cacheService';

export class DesignerService extends CacheService {
  private handleError(error: any, context: string) {
    console.error(`[${context}] Error:`, error);
    
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to error tracking service
    }
    
    return error;
  }

  async signUpDesigner(designerData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    specialization?: string;
    experienceYears?: number;
    portfolioUrl?: string;
  }) {
    try {
      console.log('Designer signup attempt:', designerData.email);
      
      // تحقق من وجود المصمم مسبقاً بالبريد الإلكتروني
      const existingDesigner = await this.checkExistingDesigner(designerData.email);
      if (existingDesigner) {
        return { 
          data: null, 
          error: { message: 'Designer already exists with this email' } 
        };
      }

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

      if (data.user && !error) {
        console.log('Designer signup successful for user:', data.user.id);
        
        // إنشاء ملف المصمم في جدول profiles
        await this.ensureDesignerProfile(data.user.id, {
          name: designerData.name,
          phone: designerData.phone || ''
        });
        
        this.clearCache('profile');
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Designer SignUp') };
    }
  }

  private async ensureDesignerProfile(userId: string, designerData: any) {
    try {
      console.log('Creating/updating designer profile for user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: designerData.name,
          phone: designerData.phone,
          role: 'designer'
        });

      if (error) {
        console.error('Error creating designer profile:', error);
      } else {
        console.log('Designer profile created successfully for user:', userId);
      }
    } catch (error) {
      console.error('Error ensuring designer profile:', error);
    }
  }

  private async checkExistingDesigner(email: string) {
    try {
      // نتحقق من وجود مصمم بنفس البريد الإلكتروني
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'designer')
        .maybeSingle();
      
      return !!data && !error;
    } catch (error) {
      return false;
    }
  }

  async getDesignerByUserId(userId: string) {
    try {
      const cacheKey = `designer_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching designer for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('role', 'designer')
        .maybeSingle();

      if (error) {
        console.error('Designer fetch error:', error);
        return null;
      }

      if (!data) {
        console.log('Designer not found, checking if user exists in profiles');
        // التحقق من وجود المستخدم في جدول profiles
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking user profile:', profileError);
          return null;
        }

        if (userProfile && userProfile.role !== 'designer') {
          console.log('User exists but is not a designer:', userProfile.role);
          return null;
        }

        if (!userProfile) {
          console.log('User profile not found, this should not happen for authenticated users');
          return null;
        }
      }
      
      if (data) {
        this.setCache(cacheKey, data);
        console.log('Designer fetched successfully:', data);
      }
      
      return data;
    } catch (error) {
      this.handleError(error, 'Get Designer');
      return null;
    }
  }

  async getDesignerByEmail(email: string) {
    try {
      console.log('Fetching designer by email:', email);
      
      // نحصل على المستخدم من الـ auth أولاً
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'designer')
        .maybeSingle();

      if (error) {
        console.error('Designer fetch by email error:', error);
        return null;
      }
      
      if (data) {
        console.log('Designer fetched by email successfully:', data);
      } else {
        console.log('No designer found for current user');
      }
      
      return data;
    } catch (error) {
      this.handleError(error, 'Get Designer By Email');
      return null;
    }
  }

  async getAllDesigners() {
    try {
      console.log('Fetching all designers');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'designer')
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get All Designers');
        return [];
      }
      
      console.log('All designers fetched successfully:', data.length);
      return data;
    } catch (error) {
      this.handleError(error, 'Get All Designers');
      return [];
    }
  }

  async updateDesigner(userId: string, updates: Partial<{
    name: string;
    phone: string;
    avatar_url: string;
  }>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .eq('role', 'designer')
        .select()
        .single();

      if (!error) {
        this.clearCache(`designer_${userId}`);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Designer') };
    }
  }

  async linkDesignerToUser(designerId: string, userId: string) {
    try {
      console.log('Linking designer to user:', { designerId, userId });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'designer' })
        .eq('id', userId)
        .select()
        .single();

      if (!error) {
        this.clearCache(`designer_${userId}`);
        console.log('Designer linked successfully:', data);
      } else {
        console.error('Error linking designer:', error);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Link Designer to User') };
    }
  }
}

export const designerService = new DesignerService();
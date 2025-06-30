
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
            specialization: designerData.specialization || 'تصميم عام',
            experience_years: designerData.experienceYears || 0,
            portfolio_url: designerData.portfolioUrl || '',
            role: 'designer'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (data.user && !error) {
        console.log('Designer signup successful for user:', data.user.id);
        
        // التأكد من إنشاء سجل المصمم في جدول designers مع الربط الصحيح
        await this.ensureDesignerRecord(data.user.id, {
          name: designerData.name,
          email: designerData.email,
          phone: designerData.phone || '',
          specialization: designerData.specialization || 'تصميم عام',
          experienceYears: designerData.experienceYears || 0,
          portfolioUrl: designerData.portfolioUrl || ''
        });
        
        this.clearCache('profile');
        this.clearCache('all_designers');
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Designer SignUp') };
    }
  }

  private async ensureDesignerRecord(userId: string, designerData: any) {
    try {
      // التحقق من وجود السجل أولاً
      const { data: existingRecord } = await supabase
        .from('designers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingRecord) {
        // إنشاء السجل إذا لم يكن موجوداً
        const { error } = await supabase
          .from('designers')
          .insert({
            user_id: userId,
            name: designerData.name,
            email: designerData.email,
            phone: designerData.phone,
            specialization: designerData.specialization,
            experience_years: designerData.experienceYears,
            portfolio_url: designerData.portfolioUrl,
            status: 'active'
          });

        if (error) {
          console.error('Error creating designer record:', error);
        } else {
          console.log('Designer record created successfully for user:', userId);
        }
      }
    } catch (error) {
      console.error('Error ensuring designer record:', error);
    }
  }

  private async checkExistingDesigner(email: string) {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('id')
        .eq('email', email)
        .single();

      return data && !error;
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
        .from('designers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Designer fetch error:', error);
        return null;
      }
      
      this.setCache(cacheKey, data);
      console.log('Designer fetched successfully:', data);
      return data;
    } catch (error) {
      this.handleError(error, 'Get Designer');
      return null;
    }
  }

  async getDesignerByEmail(email: string) {
    try {
      const cacheKey = `designer_email_${email}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching designer by email:', email);
      
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Designer fetch by email error:', error);
        return null;
      }
      
      this.setCache(cacheKey, data);
      console.log('Designer fetched by email successfully:', data);
      return data;
    } catch (error) {
      this.handleError(error, 'Get Designer By Email');
      return null;
    }
  }

  async getAllDesigners() {
    try {
      const cacheKey = 'all_designers';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      console.log('Fetching all designers');
      
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'Get All Designers');
        return [];
      }
      
      this.setCache(cacheKey, data);
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
    specialization: string;
    experience_years: number;
    portfolio_url: string;
    status: 'active' | 'inactive' | 'pending';
  }>) {
    try {
      const { data, error } = await supabase
        .from('designers')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error) {
        this.clearCache(`designer_${userId}`);
        this.clearCache('all_designers');
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: this.handleError(error, 'Update Designer') };
    }
  }
}

export const designerService = new DesignerService();

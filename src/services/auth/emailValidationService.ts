import { supabase } from '@/integrations/supabase/client';

export interface EmailCheckResult {
  exists: boolean;
  is_client: boolean;
  is_designer: boolean;
  email: string;
}

export class EmailValidationService {
  // التحقق من وجود الإيميل في النظام
  static async checkEmailExists(email: string): Promise<EmailCheckResult> {
    try {
      const { data, error } = await supabase.rpc('check_email_exists', {
        p_email: email.toLowerCase().trim()
      });

      if (error) {
        console.error('Error checking email:', error);
        throw new Error('فشل في التحقق من الإيميل');
      }

      return data;
    } catch (error) {
      console.error('Email validation error:', error);
      throw new Error('فشل في التحقق من الإيميل');
    }
  }

  // التحقق من صحة مصمم
  static async verifyDesigner(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('verify_designer', {
        p_email: email.toLowerCase().trim()
      });

      if (error) {
        console.error('Error verifying designer:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Designer verification error:', error);
      return false;
    }
  }

  // إضافة مصمم جديد
  static async addDesigner(designerData: {
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
    experience_years?: number;
    portfolio_url?: string;
  }): Promise<{ success: boolean; error?: string; designerId?: string }> {
    try {
      const { data, error } = await supabase.rpc('add_designer', {
        p_name: designerData.name,
        p_email: designerData.email.toLowerCase().trim(),
        p_phone: designerData.phone || null,
        p_specialization: designerData.specialization || null,
        p_experience_years: designerData.experience_years || 0,
        p_portfolio_url: designerData.portfolio_url || null
      });

      if (error) {
        if (error.message.includes('Email already exists')) {
          return { success: false, error: 'هذا الإيميل مسجل بالفعل في النظام' };
        }
        console.error('Error adding designer:', error);
        return { success: false, error: 'فشل في إضافة المصمم' };
      }

      return { success: true, designerId: data };
    } catch (error) {
      console.error('Add designer error:', error);
      return { success: false, error: 'فشل في إضافة المصمم' };
    }
  }

  // جلب معلومات مصمم بالإيميل
  static async getDesignerByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching designer:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get designer error:', error);
      return null;
    }
  }

  // تحديث معلومات مصمم
  static async updateDesigner(designerId: string, updates: Partial<{
    name: string;
    phone: string;
    specialization: string;
    experience_years: number;
    portfolio_url: string;
    is_verified: boolean;
    is_active: boolean;
  }>) {
    try {
      const { data, error } = await supabase
        .from('designers')
        .update(updates)
        .eq('id', designerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating designer:', error);
        return { success: false, error: 'فشل في تحديث بيانات المصمم' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Update designer error:', error);
      return { success: false, error: 'فشل في تحديث بيانات المصمم' };
    }
  }

  // جلب جميع المصممين (للأدمن فقط)
  static async getAllDesigners() {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching designers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get all designers error:', error);
      return [];
    }
  }
}
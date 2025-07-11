import { supabase } from '@/integrations/supabase/client';

export interface EmailCheckResult {
  exists: boolean;
  is_client: boolean;
  is_designer: boolean;
  email: string;
}

export class SimplifiedEmailService {
  // التحقق من وجود الإيميل في النظام
  static async checkEmailExists(email: string): Promise<EmailCheckResult> {
    try {
      // التحقق من وجود الإيميل في جدول المصممين
      const { data: designerData } = await supabase
        .from('designers')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      // التحقق من وجود الإيميل في جدول البروفايلات
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user?.id || '')
        .maybeSingle();

      const exists = !!designerData;
      const is_designer = !!designerData;
      const is_client = !!profileData && profileData.role === 'client';

      return {
        exists,
        is_client,
        is_designer,
        email: email.toLowerCase().trim()
      };
    } catch (error) {
      console.error('Email validation error:', error);
      return {
        exists: false,
        is_client: false,
        is_designer: false,
        email: email.toLowerCase().trim()
      };
    }
  }

  // التحقق من صحة مصمم
  static async verifyDesigner(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('status')
        .eq('email', email.toLowerCase().trim())
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error verifying designer:', error);
        return false;
      }

      return !!data;
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
      // التحقق من عدم وجود الإيميل مسبقاً
      const existingCheck = await this.checkEmailExists(designerData.email);
      if (existingCheck.exists) {
        return { success: false, error: 'هذا الإيميل مسجل بالفعل في النظام' };
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'المستخدم غير مسجل الدخول' };
      }

      const { data, error } = await supabase
        .from('designers')
        .insert({
          user_id: user.user.id,
          name: designerData.name,
          email: designerData.email.toLowerCase().trim(),
          phone: designerData.phone || null,
          specialization: designerData.specialization || null,
          experience_years: designerData.experience_years || 0,
          portfolio_url: designerData.portfolio_url || null,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding designer:', error);
        return { success: false, error: 'فشل في إضافة المصمم' };
      }

      return { success: true, designerId: data.id };
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
        .eq('status', 'active')
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
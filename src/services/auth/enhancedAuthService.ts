import { supabase } from '@/integrations/supabase/client';
import { EmailValidationService } from './emailValidationService';

export class EnhancedAuthService {
  // تسجيل عميل جديد مع التحقق من الإيميل
  static async signUpClient(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // التحقق من وجود الإيميل مسبقاً
      const emailCheck = await EmailValidationService.checkEmailExists(userData.email);
      
      if (emailCheck.exists) {
        if (emailCheck.is_client) {
          return { success: false, error: 'هذا الإيميل مسجل بالفعل كعميل' };
        }
        if (emailCheck.is_designer) {
          return { success: false, error: 'هذا الإيميل مسجل بالفعل كمصمم' };
        }
      }

      // إنشاء حساب العميل
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone || '',
            role: 'client'
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'هذا الإيميل مسجل بالفعل في النظام' };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Client signup error:', error);
      return { success: false, error: 'فشل في إنشاء الحساب' };
    }
  }

  // تسجيل دخول عميل
  static async signInClient(email: string, password: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // التحقق من أن الإيميل مسجل كعميل
      const emailCheck = await EmailValidationService.checkEmailExists(email);
      
      if (!emailCheck.exists) {
        return { success: false, error: 'هذا الإيميل غير مسجل في النظام' };
      }

      if (!emailCheck.is_client) {
        return { success: false, error: 'هذا الإيميل مسجل كمصمم، يرجى استخدام تسجيل دخول المصممين' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: 'فشل تسجيل الدخول. تحقق من البيانات المدخلة' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Client signin error:', error);
      return { success: false, error: 'فشل في تسجيل الدخول' };
    }
  }

  // تسجيل دخول مصمم
  static async signInDesigner(email: string, password: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // التحقق من أن الإيميل مسجل كمصمم
      const isDesigner = await EmailValidationService.verifyDesigner(email);
      
      if (!isDesigner) {
        return { success: false, error: 'هذا الإيميل غير مسجل كمصمم أو غير مفعل' };
      }

      // جلب معلومات المصمم
      const designerData = await EmailValidationService.getDesignerByEmail(email);
      
      if (!designerData) {
        return { success: false, error: 'لم يتم العثور على بيانات المصمم' };
      }

      if (!designerData.is_verified) {
        return { success: false, error: 'حسابك كمصمم لم يتم التحقق منه بعد. يرجى الانتظار' };
      }

      return { 
        success: true, 
        data: {
          designer: designerData,
          isDesigner: true
        }
      };
    } catch (error) {
      console.error('Designer signin error:', error);
      return { success: false, error: 'فشل في تسجيل الدخول' };
    }
  }

  // إنشاء حساب مصمم جديد (للأدمن فقط)
  static async createDesignerAccount(designerData: {
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
    experience_years?: number;
    portfolio_url?: string;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // إضافة المصمم إلى قاعدة البيانات
      const result = await EmailValidationService.addDesigner(designerData);
      
      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: {
          designerId: result.designerId,
          message: 'تم إنشاء حساب المصمم بنجاح'
        }
      };
    } catch (error) {
      console.error('Create designer account error:', error);
      return { success: false, error: 'فشل في إنشاء حساب المصمم' };
    }
  }

  // تسجيل الخروج
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: 'فشل في تسجيل الخروج' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'فشل في تسجيل الخروج' };
    }
  }

  // جلب المستخدم الحالي
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { user: null, profile: null, designer: null };
      }

      // جلب بيانات العميل
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // جلب بيانات المصمم (إن وجد)
      const designer = await EmailValidationService.getDesignerByEmail(user.email || '');

      return { user, profile, designer };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, profile: null, designer: null };
    }
  }
}
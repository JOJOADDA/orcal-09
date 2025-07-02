import { supabase } from '@/integrations/supabase/client';
import { EmailValidationService } from './emailValidationService';
import { AuthFixService } from './authFixService';

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
          emailRedirectTo: `${window.location.origin}/`,
          // إيقاف تأكيد البريد الإلكتروني مؤقتاً
          // يمكن تفعيله لاحقاً من إعدادات Supabase
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
      console.log('Attempting client sign in for:', email);
      
      // محاولة تسجيل الدخول مع إصلاح تلقائي لمشكلة تأكيد البريد
      const fixResult = await AuthFixService.signInWithoutEmailConfirmation(email, password);
      
      if (!fixResult.success) {
        // إذا فشل، تحقق من سبب الفشل
        if (fixResult.error?.includes('Invalid login credentials')) {
          return { success: false, error: 'بيانات تسجيل الدخول غير صحيحة' };
        }
        return { success: false, error: fixResult.error || 'فشل تسجيل الدخول' };
      }

      // التحقق من أن المستخدم عميل وليس مصمم
      if (fixResult.data?.user) {
        const emailCheck = await EmailValidationService.checkEmailExists(email);
        if (emailCheck.is_designer && !emailCheck.is_client) {
          // تسجيل خروج المستخدم إذا كان مصمم يحاول تسجيل دخول كعميل
          await supabase.auth.signOut();
          return { success: false, error: 'هذا الإيميل مسجل كمصمم، يرجى استخدام تسجيل دخول المصممين' };
        }
      }

      console.log('Client sign in successful');
      return { success: true, data: fixResult.data };
    } catch (error) {
      console.error('Client signin error:', error);
      return { success: false, error: 'فشل في تسجيل الدخول' };
    }
  }

  // تسجيل دخول مصمم
  static async signInDesigner(email: string, password: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // التحقق من أن الإيميل مسجل كمصمم
      const { data: isDesigner, error: verifyError } = await supabase.rpc('verify_designer_comprehensive', {
        p_email: email.toLowerCase().trim()
      });
      
      if (verifyError || !isDesigner) {
        return { success: false, error: 'هذا الإيميل غير مسجل كمصمم أو غير مفعل' };
      }

      // جلب معلومات المصمم
      const { data: designerData, error: getError } = await supabase.rpc('get_designer_comprehensive', {
        p_email: email.toLowerCase().trim()
      });
      
      if (getError || !designerData || designerData.length === 0) {
        return { success: false, error: 'لم يتم العثور على بيانات المصمم' };
      }

      const designer = designerData[0];
      
      if (!designer.is_verified) {
        return { success: false, error: 'حسابك كمصمم لم يتم التحقق منه بعد. يرجى الانتظار' };
      }

      return { 
        success: true, 
        data: {
          designer: designer,
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
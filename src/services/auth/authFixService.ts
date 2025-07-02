import { supabase } from '@/integrations/supabase/client';

export class AuthFixService {
  // إصلاح مشكلة تأكيد البريد الإلكتروني للمستخدمين الموجودين
  static async fixEmailConfirmationForExistingUsers() {
    try {
      // جلب جميع المستخدمين غير المؤكدين
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: error.message };
      }

      const unconfirmedUsers = users?.users.filter(user => !user.email_confirmed_at) || [];
      
      console.log(`Found ${unconfirmedUsers.length} unconfirmed users`);
      
      // تأكيد البريد الإلكتروني لكل مستخدم
      for (const user of unconfirmedUsers) {
        try {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
          );
          
          if (updateError) {
            console.error(`Error confirming user ${user.email}:`, updateError);
          } else {
            console.log(`Confirmed email for user: ${user.email}`);
          }
        } catch (userError) {
          console.error(`Error processing user ${user.email}:`, userError);
        }
      }

      return { success: true, confirmedCount: unconfirmedUsers.length };
    } catch (error) {
      console.error('General error:', error);
      return { success: false, error: 'فشل في إصلاح تأكيد البريد الإلكتروني' };
    }
  }

  // فحص حالة المستخدم
  static async checkUserStatus(email: string) {
    try {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        return { success: false, error: error.message };
      }

      const user = users?.users.find(u => u.email === email);
      
      if (!user) {
        return { success: false, error: 'المستخدم غير موجود' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at
        }
      };
    } catch (error) {
      console.error('Error checking user status:', error);
      return { success: false, error: 'فشل في فحص حالة المستخدم' };
    }
  }

  // تسجيل دخول بديل (تجاوز تأكيد البريد الإلكتروني)
  static async signInWithoutEmailConfirmation(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email);
      
      // أولاً نجرب تسجيل الدخول العادي
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error) {
        console.log('Sign in successful on first attempt');
        return { success: true, data };
      }

      console.log('Sign in error:', error.message);

      // إذا كانت المشكلة متعلقة بتأكيد البريد الإلكتروني
      if (error.message.includes('Email not confirmed')) {
        console.log('Email not confirmed - this suggests email confirmation is enabled in Supabase settings');
        return { 
          success: false, 
          error: 'يجب تأكيد البريد الإلكتروني. يرجى مراجعة إعدادات Supabase لإيقاف تأكيد البريد الإلكتروني أو تأكيد البريد من خلال الرسالة المرسلة' 
        };
      }

      // للأخطاء الأخرى
      return { success: false, error: error.message };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'فشل في تسجيل الدخول' };
    }
  }
}
import { supabase } from '@/integrations/supabase/client';

export class DesignerDiagnosticService {
  static async runFullDiagnostic(userId: string): Promise<any> {
    console.log('🔍 Running full designer diagnostic for user:', userId);
    
    const results = {
      userId,
      timestamp: new Date().toISOString(),
      userExists: false,
      profileData: null,
      designerData: null,
      roleMatch: false,
      canSendMessages: false,
      suggestions: []
    };

    try {
      // 1. التحقق من وجود المستخدم في auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        results.suggestions.push('User not authenticated - need to login again');
        return results;
      }
      results.userExists = true;

      // 2. التحقق من ملف التعريف في profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        results.suggestions.push('Error fetching profile: ' + profileError.message);
      } else {
        results.profileData = profile;
        if (!profile) {
          results.suggestions.push('Profile not found in profiles table');
        } else if (profile.role !== 'designer') {
          results.suggestions.push(`Profile role is "${profile.role}" but should be "designer"`);
        } else {
          results.roleMatch = true;
        }
      }

      // 3. التحقق من بيانات المصمم في designers
      const { data: designer, error: designerError } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (designerError) {
        console.error('Designer error:', designerError);
        results.suggestions.push('Error fetching designer: ' + designerError.message);
      } else {
        results.designerData = designer;
        if (!designer) {
          results.suggestions.push('Designer not found in designers table');
        } else if (!designer.is_active) {
          results.suggestions.push('Designer account is not active');
        } else if (!designer.is_verified) {
          results.suggestions.push('Designer account is not verified');
        }
      }

      // 4. اختبار إرسال رسالة تجريبية
      const { data: testOrder } = await supabase
        .from('design_orders')
        .select('id')
        .limit(1)
        .single();

      if (testOrder) {
        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            room_id: 'test-room-id',
            order_id: testOrder.id,
            sender_id: userId,
            sender_name: 'Test Designer',
            sender_role: 'designer',
            content: 'Test message - will be deleted',
            message_type: 'text',
            is_read: false
          })
          .select()
          .single();

        if (messageError) {
          results.canSendMessages = false;
          results.suggestions.push('Cannot send messages: ' + messageError.message);
          
          if (messageError.code === '42501') {
            results.suggestions.push('RLS policy issue - check database policies');
          }
        } else {
          results.canSendMessages = true;
          // حذف الرسالة التجريبية
          await supabase
            .from('chat_messages')
            .delete()
            .eq('content', 'Test message - will be deleted')
            .eq('sender_id', userId);
        }
      }

      // 5. تشخيص الحلول
      if (results.profileData && results.designerData && results.roleMatch) {
        if (!results.canSendMessages) {
          results.suggestions.push('All data looks correct but RLS policies are blocking. Need to fix database policies.');
        } else {
          results.suggestions.push('Everything looks good! Designer should be able to send messages.');
        }
      }

      return results;

    } catch (error) {
      console.error('Diagnostic error:', error);
      results.suggestions.push('Unexpected error during diagnostic: ' + (error as any).message);
      return results;
    }
  }

  static async fixDesignerProfile(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔧 Attempting to fix designer profile for:', userId);

      // 1. التأكد من وجود profile بدور designer
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        return { success: false, message: 'Error fetching profile: ' + profileError.message };
      }

      if (!profile) {
        // إنشاء profile جديد
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: 'مصمم',
            role: 'designer'
          });

        if (createError) {
          return { success: false, message: 'Error creating profile: ' + createError.message };
        }
      } else if (profile.role !== 'designer') {
        // تحديث الدور
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'designer' })
          .eq('id', userId);

        if (updateError) {
          return { success: false, message: 'Error updating profile role: ' + updateError.message };
        }
      }

      // 2. التأكد من تفعيل المصمم في designers table
      const { data: designer, error: designerError } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (designer && (!designer.is_active || !designer.is_verified)) {
        const { error: activateError } = await supabase
          .from('designers')
          .update({ 
            is_active: true, 
            is_verified: true 
          })
          .eq('user_id', userId);

        if (activateError) {
          return { success: false, message: 'Error activating designer: ' + activateError.message };
        }
      }

      return { success: true, message: 'Designer profile fixed successfully!' };

    } catch (error) {
      return { success: false, message: 'Unexpected error: ' + (error as any).message };
    }
  }
}

export const designerDiagnosticService = new DesignerDiagnosticService();
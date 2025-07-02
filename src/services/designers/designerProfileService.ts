import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { DesignerAuthService } from './designerAuthService';

export class DesignerProfileService {
  // إنشاء أو جلب ملف تعريف المصمم للمستخدم المصادق عليه
  static async createDesignerProfile(designerName?: string): Promise<Profile | null> {
    try {
      console.log('Creating/fetching designer profile for:', designerName);
      
      if (!designerName || designerName.trim() === '') {
        throw new Error('اسم المصمم مطلوب');
      }

      // استخدام خدمة المصادقة المحسّنة للمصممين
      return await DesignerAuthService.getOrCreateDesignerProfile(designerName);
    } catch (error) {
      console.error('Error in createDesignerProfile:', error);
      throw error;
    }
  }

  // التحقق من صحة المصمم
  static async verifyDesigner(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .eq('role', 'designer')
        .maybeSingle();

      if (error) {
        console.error('Error verifying designer:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in verifyDesigner:', error);
      return false;
    }
  }

  // الحصول على ملف المصمم للمستخدم الحالي
  static async getCurrentDesignerProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('role', 'designer')
        .maybeSingle();

      if (error) {
        console.error('Error fetching current designer profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in getCurrentDesignerProfile:', error);
      return null;
    }
  }
}
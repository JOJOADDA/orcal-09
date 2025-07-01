import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export class DesignerProfileService {
  // إنشاء أو جلب ملف تعريف المصمم للمستخدم المصادق عليه
  static async createDesignerProfile(designerName?: string): Promise<Profile | null> {
    try {
      console.log('Creating/fetching designer profile');
      
      // الحصول على المستخدم المصادق عليه الحالي
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('No authenticated user found:', authError);
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      console.log('Authenticated user:', user.id);

      // البحث عن ملف المصمم الموجود
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing profile:', fetchError);
        throw new Error('خطأ في جلب ملف المصمم');
      }

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);
        
        // التأكد من أن المستخدم مصمم
        if (existingProfile.role === 'designer') {
          return existingProfile as Profile;
        } else {
          // تحديث دور المستخدم ليصبح مصمم
          console.log('Updating user role to designer');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'designer',
              name: designerName || existingProfile.name || 'مصمم',
              updated_at: new Date().toISOString() 
            })
            .eq('id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating profile to designer:', updateError);
            throw new Error('فشل في تحديث ملف المصمم');
          }

          console.log('Profile updated to designer:', updatedProfile);
          return updatedProfile as Profile;
        }
      } else {
        // إنشاء ملف جديد للمصمم
        console.log('Creating new designer profile');
        const newProfile = {
          id: user.id,
          name: designerName || user.user_metadata?.name || 'مصمم',
          phone: user.user_metadata?.phone || '',
          role: 'designer',
          avatar_url: user.user_metadata?.avatar_url || null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating designer profile:', createError);
          throw new Error('فشل في إنشاء ملف المصمم');
        }

        console.log('Designer profile created:', createdProfile);
        return createdProfile as Profile;
      }
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
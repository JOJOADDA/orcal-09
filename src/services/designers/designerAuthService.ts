import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export class DesignerAuthService {
  // إنشاء session مؤقت للمصمم
  static async createTemporarySession(designerData: any): Promise<Profile | null> {
    try {
      console.log('Creating temporary session for designer:', designerData);
      
      // إنشاء profile مؤقت للمصمم في جدول profiles
      const tempProfile: Profile = {
        id: designerData.user_id || crypto.randomUUID(),
        name: designerData.name,
        phone: designerData.phone || '',
        role: 'designer',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // التحقق من وجود Profile مسبقاً
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tempProfile.id)
        .maybeSingle();

      if (existingProfile) {
        console.log('Found existing profile for designer:', existingProfile);
        // تحديث البيانات إذا لزم الأمر
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({
            name: designerData.name,
            role: 'designer',
            updated_at: new Date().toISOString()
          })
          .eq('id', tempProfile.id)
          .select()
          .maybeSingle();

        return (updatedProfile as Profile) || existingProfile;
      } else {
        // إنشاء profile جديد
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert(tempProfile)
          .select()
          .maybeSingle();

        if (error) {
          console.error('Error creating temporary profile:', error);
          return null;
        }

        console.log('Created temporary profile:', newProfile);
        return newProfile as Profile;
      }
    } catch (error) {
      console.error('Error in createTemporarySession:', error);
      return null;
    }
  }

  // إنشاء أو جلب ملف تعريف المصمم المتقدم
  static async getOrCreateDesignerProfile(designerName: string): Promise<Profile | null> {
    try {
      console.log('=== DesignerAuthService.getOrCreateDesignerProfile ===');
      console.log('Designer name:', designerName);

      // أولاً محاولة الحصول على المستخدم المصادق عليه من Supabase
      console.log('Checking for authenticated user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('Auth check result:', { user: !!user, authError });
      
      if (user) {
        console.log('Found authenticated user:', user.id);
        console.log('User email:', user.email);
        
        // البحث عن ملف المصمم الموجود
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (existingProfile) {
          // تحديث دور المستخدم ليصبح مصمم إذا لم يكن كذلك
          if (existingProfile.role !== 'designer') {
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .update({ 
                role: 'designer',
                name: designerName || existingProfile.name,
                updated_at: new Date().toISOString() 
              })
              .eq('id', user.id)
              .select()
              .single();

            return updatedProfile as Profile;
          }
          return existingProfile as Profile;
        } else {
          // إنشاء ملف جديد
          const newProfile = {
            id: user.id,
            name: designerName,
            phone: user.user_metadata?.phone || '',
            role: 'designer',
            avatar_url: user.user_metadata?.avatar_url || null
          };

          const { data: createdProfile } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          return createdProfile as Profile;
        }
      } else {
        console.log('No authenticated user found, checking designers table...');
        
        // إذا لم يكن هناك مستخدم مصادق عليه، نبحث في جدول المصممين
        console.log('Searching for designer by name in designers table...');
        const { data: designerData, error: designerError } = await supabase
          .from('designers')
          .select('*')
          .eq('name', designerName)
          .eq('is_active', true)
          .eq('is_verified', true)
          .maybeSingle();

        console.log('Designer search result:', { 
          found: !!designerData, 
          error: designerError,
          designerData: designerData ? 'Found' : 'Not found'
        });

        if (designerData) {
          console.log('Found designer data, creating temporary session...');
          return await this.createTemporarySession(designerData);
        }

        console.error('No designer found with name:', designerName);
        throw new Error('لم يتم العثور على بيانات المصمم');
      }
    } catch (error) {
      console.error('Error in getOrCreateDesignerProfile:', error);
      throw error;
    }
  }

  // التحقق من صحة المصمم
  static async verifyDesigner(userId: string): Promise<boolean> {
    try {
      // التحقق من جدول profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .eq('role', 'designer')
        .maybeSingle();

      if (profile) {
        return true;
      }

      // التحقق من جدول designers
      const { data: designer } = await supabase
        .from('designers')
        .select('is_verified, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_verified', true)
        .maybeSingle();

      return !!designer;
    } catch (error) {
      console.error('Error in verifyDesigner:', error);
      return false;
    }
  }
}
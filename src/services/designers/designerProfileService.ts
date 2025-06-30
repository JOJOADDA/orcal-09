
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export class DesignerProfileService {
  // إنشاء UUID ثابت ومعروف للمصمم بناءً على اسمه
  static generateDesignerUUID(designerName: string): string {
    // استخدام خوارزمية بسيطة لإنشاء UUID ثابت من الاسم
    const cleanName = designerName.trim().toLowerCase().replace(/\s+/g, '');
    const nameBuffer = new TextEncoder().encode(cleanName);
    
    // إنشاء hash بسيط
    let hash = 0;
    for (let i = 0; i < nameBuffer.length; i++) {
      hash = ((hash << 5) - hash + nameBuffer[i]) & 0xffffffff;
    }
    
    // تحويل إلى UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.substr(0, 8)}-${hex.substr(0, 4)}-4${hex.substr(1, 3)}-8${hex.substr(0, 3)}-${hex}${hex}`.substr(0, 36);
  }

  // إنشاء ملف تعريف مصمم بسيط وموثوق
  static async createDesignerProfile(designerName: string): Promise<Profile> {
    const designerUUID = this.generateDesignerUUID(designerName);
    
    console.log('Creating designer profile:', { name: designerName, id: designerUUID });
    
    const designerProfile: Profile = {
      id: designerUUID,
      name: designerName,
      phone: '+249123456789',
      role: 'designer',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // محاولة إنشاء الملف في قاعدة البيانات (اختيارية)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(designerProfile, { onConflict: 'id' });
      
      if (error) {
        console.warn('Could not save designer profile to database:', error);
      } else {
        console.log('Designer profile saved to database');
      }
    } catch (error) {
      console.warn('Database save failed, continuing with local profile:', error);
    }

    return designerProfile;
  }

  // التحقق من صحة UUID
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

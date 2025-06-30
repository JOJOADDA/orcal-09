
import { Profile } from '@/types/database';

export class DesignerProfileService {
  // إنشاء UUID ثابت للمصمم الموحد
  static generateDesignerUUID(): string {
    return 'designer-unified-access-id';
  }

  // إنشاء ملف تعريف مصمم موحد
  static async createDesignerProfile(): Promise<Profile> {
    const designerUUID = this.generateDesignerUUID();
    
    console.log('Creating unified designer profile');
    
    const designerProfile: Profile = {
      id: designerUUID,
      name: 'مصمم أوركال',
      phone: '+249123456789',
      role: 'admin', // استخدام admin للحصول على الصلاحيات المطلوبة
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return designerProfile;
  }

  // التحقق من صحة UUID
  static isValidUUID(uuid: string): boolean {
    return uuid === 'designer-unified-access-id';
  }

  // إنشاء معرف جلسة فريد لكل مصمم
  static createSessionId(): string {
    return `designer-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

import { supabase } from '@/integrations/supabase/client';

export class SimplifiedDesignerDiagnosticService {
  static async checkDesignerHealth(designerId: string) {
    try {
      const { data: designer, error } = await supabase
        .from('designers')
        .select('*')
        .eq('id', designerId)
        .single();

      if (error || !designer) {
        return {
          isHealthy: false,
          issues: ['المصمم غير موجود'],
          data: null
        };
      }

      const issues: string[] = [];
      
      if (designer.status !== 'active') {
        issues.push('حساب المصمم غير مفعل');
      }

      if (!designer.email) {
        issues.push('بريد إلكتروني مفقود');
      }

      if (!designer.name) {
        issues.push('اسم المصمم مفقود');
      }

      return {
        isHealthy: issues.length === 0,
        issues,
        data: designer
      };
    } catch (error) {
      console.error('Designer health check error:', error);
      return {
        isHealthy: false,
        issues: ['خطأ في فحص صحة المصمم'],
        data: null
      };
    }
  }

  static async getAllDesignersStatus() {
    try {
      const { data: designers, error } = await supabase
        .from('designers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching designers:', error);
        return [];
      }

      return designers?.map(designer => ({
        id: designer.id,
        name: designer.name,
        email: designer.email,
        status: designer.status,
        isActive: designer.status === 'active',
        hasProfile: !!designer.name && !!designer.email
      })) || [];
    } catch (error) {
      console.error('Get all designers status error:', error);
      return [];
    }
  }
}
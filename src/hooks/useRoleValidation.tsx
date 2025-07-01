import { useState, useEffect } from 'react';
import { Profile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface UseRoleValidationProps {
  user: Profile | null;
}

export const useRoleValidation = ({ user }: UseRoleValidationProps) => {
  const [isValidRole, setIsValidRole] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsValidRole(false);
      setRoleError('المستخدم غير مصادق عليه');
      return;
    }

    // التحقق من صحة الدور
    const validRoles = ['client', 'admin', 'designer'];
    if (!validRoles.includes(user.role)) {
      setIsValidRole(false);
      setRoleError('نوع المستخدم غير صالح');
      return;
    }

    // التحقق من تطابق الدور مع قاعدة البيانات
    const verifyUserRole = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error verifying user role:', error);
          setIsValidRole(false);
          setRoleError('فشل في التحقق من صحة المستخدم');
          return;
        }

        if (!profileData || profileData.role !== user.role) {
          setIsValidRole(false);
          setRoleError('تضارب في نوع المستخدم');
          return;
        }

        setIsValidRole(true);
        setRoleError(null);
      } catch (error) {
        console.error('Unexpected error during role verification:', error);
        setIsValidRole(false);
        setRoleError('خطأ غير متوقع');
      }
    };

    verifyUserRole();
  }, [user]);

  const isClient = user?.role === 'client';
  const isDesigner = user?.role === 'designer';
  const isAdmin = user?.role === 'admin';

  return {
    isValidRole,
    roleError,
    isClient,
    isDesigner,
    isAdmin,
    userRole: user?.role
  };
};
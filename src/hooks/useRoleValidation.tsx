import { Profile } from '@/types/database';

interface UseRoleValidationProps {
  user: Profile | null;
}

export const useRoleValidation = ({ user }: UseRoleValidationProps) => {
  // بما أن البيانات تأتي من قاعدة البيانات مباشرة، فلا حاجة للتحقق المعقد
  const validRoles = ['client', 'admin', 'designer'];
  
  const isValidRole = !user || validRoles.includes(user.role);
  const roleError = !isValidRole ? 'نوع المستخدم غير صالح' : null;

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
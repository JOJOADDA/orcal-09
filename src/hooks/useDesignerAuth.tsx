
import { useState, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

export const useDesignerAuth = () => {
  const [designerUser, setDesignerUser] = useState<any>(null);
  const [isDesignerAuthenticated, setIsDesignerAuthenticated] = useState(false);
  const [showDesignerAuth, setShowDesignerAuth] = useState(false);

  // Designer authentication handlers
  const handleDesignerLogin = useCallback(async (designerData: { name: string; role: string; email?: string; id?: string }) => {
    console.log('Designer login handler called with:', designerData);
    
    // إذا لم يكن هناك ID، استخدم ID المستخدم المصادق عليه الحالي
    if (!designerData.id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        designerData.id = user.id;
      }
    }
    
    setDesignerUser(designerData);
    setIsDesignerAuthenticated(true);
    setShowDesignerAuth(false);
    console.log('Designer authenticated successfully');
  }, []);

  const handleDesignerLogout = useCallback(async () => {
    try {
      console.log('Designer logout initiated');
      await supabaseService.signOut();
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
      console.log('Designer logout completed successfully');
    } catch (error) {
      console.error('Error during designer logout:', error);
      // Force logout even if there's an error
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
      console.log('Designer logout forced due to error');
    }
  }, []);

  return {
    designerUser,
    isDesignerAuthenticated,
    showDesignerAuth,
    setShowDesignerAuth,
    handleDesignerLogin,
    handleDesignerLogout
  };
};


import { useState, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';

export const useDesignerAuth = () => {
  const [designerUser, setDesignerUser] = useState<any>(null);
  const [isDesignerAuthenticated, setIsDesignerAuthenticated] = useState(false);
  const [showDesignerAuth, setShowDesignerAuth] = useState(false);

  // Designer authentication handlers
  const handleDesignerLogin = useCallback(async (designerData: { name: string; role: string; email: string }) => {
    setDesignerUser(designerData);
    setIsDesignerAuthenticated(true);
    setShowDesignerAuth(false);
  }, []);

  const handleDesignerLogout = useCallback(async () => {
    try {
      await supabaseService.signOut();
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
    } catch (error) {
      console.error('Error during designer logout:', error);
      // Force logout even if there's an error
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
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

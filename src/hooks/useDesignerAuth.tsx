
import { useState, useCallback } from 'react';
import { EnhancedAuthService } from '@/services/auth/enhancedAuthService';

export const useDesignerAuth = () => {
  const [designerUser, setDesignerUser] = useState<any>(null);
  const [isDesignerAuthenticated, setIsDesignerAuthenticated] = useState(false);
  const [showDesignerAuth, setShowDesignerAuth] = useState(false);

  // Designer authentication handlers
  const handleDesignerLogin = useCallback(async (designerData: { name: string; role: string; email?: string; id?: string }) => {
    console.log('Designer login handler called with:', designerData);
    
    setDesignerUser(designerData);
    setIsDesignerAuthenticated(true);
    setShowDesignerAuth(false);
    console.log('Designer authenticated successfully');
  }, []);

  const handleDesignerLogout = useCallback(async () => {
    try {
      console.log('Designer logout initiated');
      await EnhancedAuthService.signOut();
      setDesignerUser(null);
      setIsDesignerAuthenticated(false);
      console.log('Designer logout completed successfully');
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

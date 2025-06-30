
import { useState, useCallback } from 'react';

export const useDesignerAccess = () => {
  const [isDesignerAuthenticated, setIsDesignerAuthenticated] = useState(false);
  const [showDesignerAccess, setShowDesignerAccess] = useState(false);

  const handleDesignerAccess = useCallback(() => {
    setIsDesignerAuthenticated(true);
    setShowDesignerAccess(false);
  }, []);

  const handleDesignerLogout = useCallback(() => {
    setIsDesignerAuthenticated(false);
  }, []);

  return {
    isDesignerAuthenticated,
    showDesignerAccess,
    setShowDesignerAccess,
    handleDesignerAccess,
    handleDesignerLogout
  };
};

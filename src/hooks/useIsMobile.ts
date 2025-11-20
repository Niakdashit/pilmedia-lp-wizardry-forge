import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si l'utilisateur est sur mobile
 * Combine la détection de l'user agent ET la taille de l'écran
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Détection par user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      
      // Détection par taille d'écran (< 768px = mobile)
      const isMobileScreen = window.innerWidth < 768;

      // On est mobile si :
      // - User agent mobile OU
      // - Écran petit (logique responsive, y compris simulateurs DevTools)
      setIsMobile(isMobileUA || isMobileScreen);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};


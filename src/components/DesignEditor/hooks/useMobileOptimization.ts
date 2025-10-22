import { useEffect, useCallback, useRef, useState } from 'react';
import { shouldForceDesktopEditorUI } from '@/utils/deviceOverrides';

interface MobileOptimizationConfig {
  preventScrollBounce: boolean;
  stabilizeViewport: boolean;
  optimizeTouchEvents: boolean;
  preventZoomGestures: boolean;
}

interface TouchCalibration {
  offsetX: number;
  offsetY: number;
  sensitivity: number;
  precision: number;
}

export const useMobileOptimization = (
  containerRef: React.RefObject<HTMLElement>,
  config: MobileOptimizationConfig = {
    preventScrollBounce: true,
    stabilizeViewport: true,
    optimizeTouchEvents: true,
    preventZoomGestures: true
  }
) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [touchCalibration, setTouchCalibration] = useState<TouchCalibration>({
    offsetX: 0,
    offsetY: 0,
    sensitivity: 1.0,
    precision: 1.0
  });

  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const viewportMetaRef = useRef<HTMLMetaElement | null>(null);

  // Détection précise de l'appareil
  const detectDevice = useCallback(() => {
    if (typeof window === 'undefined') {
      setIsMobile(false);
      setIsTablet(false);
      setTouchCalibration({
        offsetX: 0,
        offsetY: 0,
        sensitivity: 1.0,
        precision: 1.0
      });
      return { isMobile: false, isTablet: false };
    }

    if (shouldForceDesktopEditorUI()) {
      setIsMobile(false);
      setIsTablet(false);
      setTouchCalibration({
        offsetX: 0,
        offsetY: 0,
        sensitivity: 1.0,
        precision: 1.0
      });
      return { isMobile: false, isTablet: false };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const minDim = Math.min(width, height);
    const userAgent = navigator.userAgent;
    // Some iPads on iPadOS report desktop UA (e.g., "Macintosh"). Use touch capability as a fallback.
    const touchCapable = typeof navigator !== 'undefined' && (navigator as any).maxTouchPoints > 1;

    const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    let inferredTablet = false;
    let inferredMobile = false;

    if (uaMobile) {
      inferredTablet = minDim >= 768;
      inferredMobile = !inferredTablet;
    } else if (touchCapable) {
      // Treat touch-capable large screens as tablets, smaller as phones
      inferredTablet = minDim >= 768;
      inferredMobile = !inferredTablet;
    }

    setIsMobile(inferredMobile);
    setIsTablet(inferredTablet);

    // Calibrage tactile selon l'appareil
    if (inferredMobile) {
      setTouchCalibration({
        offsetX: 2,
        offsetY: 8,
        sensitivity: 1.1,
        precision: 0.95
      });
    } else if (inferredTablet) {
      setTouchCalibration({
        offsetX: 1,
        offsetY: 4,
        sensitivity: 1.05,
        precision: 0.98
      });
    } else {
      setTouchCalibration({
        offsetX: 0,
        offsetY: 0,
        sensitivity: 1.0,
        precision: 1.0
      });
    }

    return { isMobile: inferredMobile, isTablet: inferredTablet };
  }, []);

  // Stabiliser le viewport mobile
  const stabilizeViewport = useCallback(() => {
    if (!config.stabilizeViewport) return;

    // Créer ou mettre à jour la balise meta viewport
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    // Configuration viewport optimisée pour l'éditeur mobile
    viewportMeta.content = [
      'width=device-width',
      'initial-scale=1.0',
      'maximum-scale=1.0',
      'minimum-scale=1.0',
      'user-scalable=no',
      'viewport-fit=cover',
      'shrink-to-fit=no'
    ].join(', ');

    viewportMetaRef.current = viewportMeta;

    // Empêcher le zoom par pincement
    if (config.preventZoomGestures) {
      const preventZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchstart', preventZoom, { passive: false });
      document.addEventListener('touchmove', preventZoom, { passive: false });

      return () => {
        document.removeEventListener('touchstart', preventZoom);
        document.removeEventListener('touchmove', preventZoom);
      };
    }
  }, [config.stabilizeViewport, config.preventZoomGestures]);

  // Empêcher le scroll bounce sur iOS
  const preventScrollBounce = useCallback(() => {
    if (!config.preventScrollBounce || !containerRef.current) return;

    const container = containerRef.current;
    
    const preventBounce = (e: TouchEvent) => {
      const target = e.target as HTMLElement;

      // Permettre le scroll uniquement dans les zones scrollables spécifiques
      const isScrollableArea = target.closest('.scrollable-area, .sidebar-content, .panel-content');

      if (!isScrollableArea && e.type === 'touchmove' && e.cancelable) {
        e.preventDefault();
      }
    };

    // Empêcher le scroll bounce sur le container principal
    container.addEventListener('touchstart', preventBounce, { passive: false });
    container.addEventListener('touchmove', preventBounce, { passive: false });

    // Empêcher le scroll bounce sur le body
    document.body.style.overscrollBehavior = 'none';
    document.body.style.touchAction = 'pan-x pan-y';
    document.documentElement.style.overscrollBehavior = 'none';

    return () => {
      container.removeEventListener('touchstart', preventBounce);
      container.removeEventListener('touchmove', preventBounce);
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [config.preventScrollBounce, containerRef]);

  // Optimiser les événements tactiles
  const optimizeTouchEvents = useCallback(() => {
    if (!config.optimizeTouchEvents || !containerRef.current) return;

    const container = containerRef.current;

    // Améliorer la réactivité tactile
    container.style.touchAction = 'manipulation';
    container.style.userSelect = 'none';
    (container.style as any).webkitUserSelect = 'none';
    (container.style as any).webkitTouchCallout = 'none';
    (container.style as any).webkitTapHighlightColor = 'transparent';

    // Optimiser les performances tactiles
    const optimizeTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const now = Date.now();
      const currentTouch = {
        x: touch.clientX,
        y: touch.clientY,
        time: now
      };

      // Filtrer les événements tactiles trop rapprochés
      if (lastTouchRef.current) {
        const timeDiff = now - lastTouchRef.current.time;
        const distance = Math.sqrt(
          Math.pow(currentTouch.x - lastTouchRef.current.x, 2) +
          Math.pow(currentTouch.y - lastTouchRef.current.y, 2)
        );

        // Ignorer les micro-mouvements
        if (timeDiff < 16 && distance < 2) {
          return;
        }
      }

      lastTouchRef.current = currentTouch;
    };

    container.addEventListener('touchstart', optimizeTouch, { passive: true });
    container.addEventListener('touchmove', optimizeTouch, { passive: true });

    return () => {
      container.removeEventListener('touchstart', optimizeTouch);
      container.removeEventListener('touchmove', optimizeTouch);
    };
  }, [config.optimizeTouchEvents, containerRef]);

  // Convertir les coordonnées tactiles avec calibrage
  const convertTouchCoordinates = useCallback((
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
    if (!containerRef.current) {
      return { x: clientX, y: clientY };
    }

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Appliquer le calibrage tactile
    let adjustedX = clientX - touchCalibration.offsetX;
    let adjustedY = clientY - touchCalibration.offsetY;

    // Convertir en coordonnées relatives au container
    const relativeX = (adjustedX - rect.left) * touchCalibration.precision;
    const relativeY = (adjustedY - rect.top) * touchCalibration.precision;

    return {
      x: relativeX * touchCalibration.sensitivity,
      y: relativeY * touchCalibration.sensitivity
    };
  }, [containerRef, touchCalibration]);

  // Détecter si c'est un événement tactile
  const isTouchEvent = useCallback((e: any): boolean => {
    return e.type.startsWith('touch') || 
           (e.pointerType && e.pointerType === 'touch') ||
           ('touches' in e);
  }, []);

  // Initialisation
  useEffect(() => {
    const { isMobile: mobile, isTablet: tablet } = detectDevice();
    const forcingDesktop = shouldForceDesktopEditorUI();

    console.log('📱 Mobile Optimization initialized:', {
      isMobile: mobile,
      isTablet: tablet,
      width: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
      height: typeof window !== 'undefined' ? window.innerHeight : 'N/A',
      minDim:
        typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      touchCapable: typeof navigator !== 'undefined' ? (navigator as any).maxTouchPoints > 1 : false,
      touchCalibration,
      config,
      forcingDesktop
    });

    if (forcingDesktop) {
      return;
    }

    const cleanupViewport = stabilizeViewport();
    const cleanupBounce = preventScrollBounce();
    const cleanupTouch = optimizeTouchEvents();

    // Réagir aux changements d'orientation
    const handleOrientationChange = () => {
      setTimeout(() => {
        detectDevice();
        stabilizeViewport();
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      cleanupViewport?.();
      cleanupBounce?.();
      cleanupTouch?.();
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [detectDevice, stabilizeViewport, preventScrollBounce, optimizeTouchEvents]);

  return {
    isMobile,
    isTablet,
    touchCalibration,
    convertTouchCoordinates,
    isTouchEvent,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  };
};

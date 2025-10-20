import React, { useRef, useEffect, useState } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface MobileStableEditorProps {
  children: React.ReactNode;
  className?: string;
}

const MobileStableEditor: React.FC<MobileStableEditorProps> = ({
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    isMobile, 
    isTablet, 
    deviceType 
  } = useMobileOptimization(containerRef, {
    preventScrollBounce: true,
    stabilizeViewport: true,
    optimizeTouchEvents: true,
    preventZoomGestures: false
  });

  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      const container = containerRef.current;
      
      // Styles de stabilisation mobile
      const mobileStyles = {
        // Empêcher le scroll et le bounce
        overscrollBehavior: 'none',
        touchAction: 'pan-x pan-y',
        webkitOverflowScrolling: 'touch',
        
        // Optimiser les performances tactiles
        willChange: 'auto',
        backfaceVisibility: 'hidden',
        
        // Empêcher la sélection de texte accidentelle
        userSelect: 'none',
        webkitUserSelect: 'none',
        webkitTouchCallout: 'none',
        webkitTapHighlightColor: 'transparent',
        
        // Stabiliser la position
        position: 'relative' as const,
        overflow: 'visible',
        
        // Hauteur fixe pour éviter les redimensionnements
        height: '100dvh',
        maxHeight: '100dvh',
        minHeight: '100dvh'
      };

      // Appliquer les styles selon l'appareil
      if (isMobile || isTablet) {
        Object.assign(container.style, mobileStyles);
        
        // Styles spécifiques mobile
        if (isMobile) {
          container.style.minHeight = '100dvh';
          container.style.paddingBottom = 'env(safe-area-inset-bottom)';
        }
        
        // Empêcher le zoom double-tap
        container.addEventListener('touchstart', (e) => {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        }, { passive: false });
        
        // Empêcher le menu contextuel long press
        container.addEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
        
        console.log('📱 Mobile Stable Editor initialized for:', deviceType);
      }
      
      setIsInitialized(true);
    }
  }, [isMobile, isTablet, deviceType, isInitialized]);

  // Classes CSS dynamiques selon l'appareil
  const getDeviceClasses = () => {
    const baseClasses = 'mobile-stable-editor';
    const deviceClasses: Record<string, string> = {
      mobile: 'mobile-optimized',
      tablet: 'tablet-optimized', 
      desktop: 'desktop-optimized'
    };
    
    return `${baseClasses} ${deviceClasses[deviceType] || 'desktop-optimized'} ${className}`;
  };

  return (
    <div 
      ref={containerRef}
      className={getDeviceClasses()}
      data-device={deviceType}
      data-mobile-optimized={(isMobile || isTablet).toString()}
    >
      {children}
      
      {/* Styles CSS intégrés pour l'optimisation mobile */}
      <style>{`
        .mobile-stable-editor {
          /* Base stable */
          position: relative;
          width: 100%;
          height: 100dvh;
          /* Clip content to show rounded corners */
          overflow: hidden;
          /* Create a stacking context */
          isolation: isolate;
        }
        
        .mobile-optimized {
          /* Optimisations spécifiques mobile */
          overscroll-behavior: none;
          touch-action: manipulation;
          -webkit-overflow-scrolling: touch;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
          
          /* Performance */
          will-change: auto;
          backface-visibility: hidden;
          
          /* Safe areas iOS - optimized for canvas visibility */
          padding-top: env(safe-area-inset-top);
          padding-bottom: calc(env(safe-area-inset-bottom) + 60px); /* Reduced padding for better canvas space */
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          
          /* Ensure content doesn't get hidden behind tab bar */
          box-sizing: border-box;
          
          /* Maximize available space for canvas */
          display: flex;
          flex-direction: column;
        }
        
        .tablet-optimized {
          /* Optimisations spécifiques tablette */
          overscroll-behavior: none;
          touch-action: pan-x pan-y;
          -webkit-overflow-scrolling: touch;
          
          /* Performance */
          will-change: transform;
          transform: translateZ(0);
        }
        
        .desktop-optimized {
          /* Comportement normal desktop */
          touch-action: auto;
          user-select: text;
        }
        
        /* Empêcher le scroll sur les éléments enfants non-scrollables */
        .mobile-optimized * {
          overscroll-behavior: none;
        }
        
        /* Permettre le scroll uniquement sur les zones désignées */
        .mobile-optimized .scrollable-area {
          overscroll-behavior: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Optimiser les transitions tactiles */
        .mobile-optimized .touchable {
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(0,0,0,0.1);
          transition: transform 0.1s ease-out;
        }
        
        .mobile-optimized .touchable:active {
          transform: scale(0.98);
        }
        
        /* Stabiliser les inputs sur mobile */
        .mobile-optimized input,
        .mobile-optimized textarea,
        .mobile-optimized select {
          touch-action: manipulation;
          -webkit-appearance: none;
          border-radius: 0;
        }
        
        /* Empêcher le zoom sur les inputs */
        .mobile-optimized input[type="text"],
        .mobile-optimized input[type="number"],
        .mobile-optimized textarea {
          font-size: 16px; /* Empêche le zoom iOS */
        }
        
        /* Canvas stable */
        .mobile-optimized canvas {
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }
        
        /* Sidebar mobile stable */
        .mobile-optimized .sidebar-content {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default MobileStableEditor;

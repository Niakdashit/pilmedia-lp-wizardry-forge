import React, { useState, useEffect, useRef } from 'react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { useMobileCanvasLock } from '../hooks/useMobileCanvasLock';
import MobileToolbarOverlay from './MobileToolbarOverlay';
import MobileSidebarDrawer from './MobileSidebarDrawer';


interface MobileResponsiveLayoutProps {
  children: React.ReactNode;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  className?: string;
  // Forcer l'UI mobile/tablette selon l'appareil sélectionné dans l'éditeur
  forcedDevice?: 'desktop' | 'tablet' | 'mobile';
  forceMobileUI?: boolean;
  // Props pour la sidebar mobile
  onAddElement?: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
}

const MobileResponsiveLayout: React.FC<MobileResponsiveLayoutProps> = ({
  children,
  selectedElement,
  onElementUpdate,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  canvasRef,
  zoom,
  onZoomChange,
  className = '',
  forcedDevice,
  forceMobileUI,
  // Props pour la sidebar mobile
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  campaignConfig,
  onCampaignConfigChange,
  elements,
  onElementsChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  // Optimisation mobile
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

  // Déterminer l'appareil effectif et le mode UI à utiliser
  const resolvedDevice = (forcedDevice ?? deviceType) as 'desktop' | 'tablet' | 'mobile';
  const isMobileUI = Boolean(forceMobileUI || isMobile || isTablet || resolvedDevice !== 'desktop');

  // Système de verrouillage du canvas pour mobile
  const {
    isDragging
  } = useMobileCanvasLock({
    canvasRef,
    selectedElement,
    isMobile,
    isTablet,
    zoom
  });

  // Gestion de la visibilité de la toolbar mobile
  useEffect(() => {
    if (selectedElement && isMobileUI) {
      setIsToolbarVisible(true);
    } else {
      setIsToolbarVisible(false);
    }
  }, [selectedElement, isMobileUI]);

  // Écouteur pour l'ajustement automatique du zoom
  useEffect(() => {
    const handleZoomAdjust = (event: CustomEvent) => {
      if (onZoomChange && isMobileUI) {
        onZoomChange(event.detail.zoom);
      }
    };

    window.addEventListener('adjustCanvasZoom', handleZoomAdjust as EventListener);
    return () => {
      window.removeEventListener('adjustCanvasZoom', handleZoomAdjust as EventListener);
    };
  }, [onZoomChange, isMobileUI]);

  // Classes CSS dynamiques selon l'appareil
  const getLayoutClasses = () => {
    const baseClasses = 'mobile-responsive-layout';
    const deviceClasses: Record<string, string> = {
      mobile: 'mobile-layout',
      tablet: 'tablet-layout',
      desktop: 'desktop-layout'
    };
    
    const stateClasses = [
      isDragging ? 'is-dragging' : '',
      isToolbarVisible ? 'toolbar-visible' : '',
      selectedElement ? 'has-selection' : ''
    ].filter(Boolean).join(' ');

    return `${baseClasses} ${deviceClasses[resolvedDevice] || 'desktop-layout'} ${stateClasses}`;
  };

  return (
    <div 
      ref={containerRef}
      className={getLayoutClasses()}
      data-device={resolvedDevice}
      data-mobile-optimized={isMobileUI.toString()}
    >
      {/* Contenu principal */}
      <div className={`layout-content ${className}`}>
        {children}
      </div>

      {/* Toolbar mobile overlay - s'affiche au-dessus de l'élément sélectionné */}
      {isToolbarVisible && isMobileUI && selectedElement && onElementUpdate && (
        <MobileToolbarOverlay
          selectedElement={selectedElement}
          onElementUpdate={onElementUpdate}
          onShowEffectsPanel={onShowEffectsPanel}
          onShowAnimationsPanel={onShowAnimationsPanel}
          onShowPositionPanel={onShowPositionPanel}
          canvasRef={canvasRef}
          zoom={zoom}
        />
      )}

      {/* Sidebar mobile drawer - seulement sur mobile */}
      {isMobileUI && onAddElement && (
        <MobileSidebarDrawer
          onAddElement={onAddElement}
          onBackgroundChange={onBackgroundChange}
          onExtractedColorsChange={onExtractedColorsChange}
          campaignConfig={campaignConfig}
          onCampaignConfigChange={onCampaignConfigChange}
          elements={elements}
          onElementsChange={onElementsChange}
          selectedElement={selectedElement}
          onElementUpdate={onElementUpdate}
        />
      )}


      {/* Styles CSS intégrés pour la responsivité mobile */}
      <style>{`
        .mobile-responsive-layout {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Layout mobile */
        .mobile-layout {
          /* Canvas toujours visible entièrement */
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          
          /* Empêcher le scroll */
          overscroll-behavior: none;
          touch-action: manipulation;
          -webkit-overflow-scrolling: touch;
          
          /* Optimisations tactiles */
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
          
          /* Safe areas iOS */
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }

        .mobile-layout .layout-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* Masquer la sidebar sur mobile - affichée via drawer */
        .mobile-layout .hybrid-sidebar {
          display: none !important;
        }

        /* Masquer la toolbar canvas sur mobile (sauf overlays utiles) */
        .mobile-layout .z-10.canvas-toolbar {
          display: none !important;
        }

        /* Ajuster le canvas pour mobile */
        .mobile-layout .design-canvas-container {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 10px;
          overflow: hidden;
          position: relative;
        }

        /* Canvas bloqué sur mobile - empêcher les interactions non désirées */
        .mobile-layout.is-dragging {
          /* Bloquer tout scroll pendant le drag */
          overflow: hidden;
          touch-action: none;
        }

        .mobile-layout.is-dragging * {
          pointer-events: none;
        }
        

        .mobile-layout.is-dragging [data-element-id] {
          pointer-events: auto;
        }

        .mobile-layout.is-dragging .mobile-toolbar-overlay {
          pointer-events: auto;
        }

        /* Autoriser les interactions avec les boutons pendant le drag */
        .mobile-layout.is-dragging button {
          pointer-events: auto;
        }

        /* Autoriser les interactions avec les éléments de contrôle */
        .mobile-layout.is-dragging [class*="z-[7"]:has(button) {
          pointer-events: auto;
        }

        /* IMPORTANT: Autoriser les interactions avec la sidebar et ses onglets */
        .mobile-layout.is-dragging .w-20,
        .mobile-layout.is-dragging .w-80,
        .mobile-layout.is-dragging [class*="sidebar"],
        .mobile-layout.is-dragging .mobile-sidebar-drawer,
        .mobile-layout.is-dragging .mobile-sidebar-drawer *,
        .mobile-layout.is-dragging .mobile-sidebar-overlay {
          pointer-events: auto !important;
        }

        .mobile-layout.is-dragging .w-20 button,
        .mobile-layout.is-dragging .w-80 button {
          pointer-events: auto !important;
        }

        /* Toolbar mobile */
        .mobile-layout .mobile-toolbar-overlay {
          /* Toujours au-dessus */
          z-index: 1000;
          
          /* Animation d'apparition */
          animation: mobileToolbarFadeIn 0.2s ease-out;
        }

        @keyframes mobileToolbarFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        
        .tablet-layout {
          /* Comportement hybride entre mobile et desktop */
          display: flex;
          height: 100vh;
          overflow: hidden;
          
          /* Optimisations tactiles réduites */
          overscroll-behavior: none;
          touch-action: pan-x pan-y;
        }

        .tablet-layout .hybrid-sidebar {
          /* Sidebar réduite sur tablette */
          width: 250px !important;
          min-width: 250px !important;
        }

        .tablet-layout .layout-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Layout desktop */
        .desktop-layout {
          /* Comportement normal */
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .desktop-layout .layout-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Masquer la toolbar mobile sur desktop */
        .desktop-layout .mobile-toolbar-overlay {
          display: none !important;
        }

        /* Ajustements pour la toolbar visible */
        .mobile-layout.toolbar-visible .design-canvas-container {
          /* Réduire légèrement le padding pour laisser place à la toolbar */
          padding-top: 60px;
        }

        

        /* Empêcher le zoom accidentel sur iOS */
        .mobile-layout input,
        .mobile-layout textarea,
        .mobile-layout select {
          font-size: 16px !important; /* Empêche le zoom iOS */
          -webkit-appearance: none;
          border-radius: 0;
        }

        /* Canvas stable sur mobile */
        .mobile-layout canvas {
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
          
          /* Empêcher les interactions accidentelles */
          pointer-events: auto;
        }

        /* Éléments interactifs sur le canvas */
        .mobile-layout [data-element-id] {
          /* Permettre les interactions sur les éléments */
          touch-action: manipulation;
          cursor: move;
          
          /* Feedback tactile */
          transition: transform 0.1s ease-out;
        }

        .mobile-layout [data-element-id]:active {
          transform: scale(1.02);
        }

        /* Zone de canvas non-interactive sur mobile */
        .mobile-layout .canvas-background {
          /* Empêcher les interactions sur le fond mais pas sur les boutons */
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
        }

        /* Autoriser les interactions avec tous les boutons */
        .mobile-layout button {
          pointer-events: auto !important;
        }

        /* Autoriser les interactions avec les éléments interactifs */
        .mobile-layout [class*="z-[7"]:has(button) {
          pointer-events: auto !important;
        }

        /* IMPORTANT: Autoriser TOUJOURS les interactions avec la sidebar */
        .mobile-layout .w-20,
        .mobile-layout .w-80,
        .mobile-layout [class*="sidebar"],
        .mobile-layout .w-20 *,
        .mobile-layout .w-80 * {
          pointer-events: auto !important;
        }

        /* Optimisations de performance pour mobile */
        .mobile-layout * {
          /* Accélération matérielle */
          will-change: auto;
          backface-visibility: hidden;
        }

        .mobile-layout.is-dragging [data-element-id] {
          will-change: transform;
        }

        /* Responsive breakpoints */
        @media (max-width: 767px) {
          .mobile-responsive-layout {
            /* Force mobile layout */
            --mobile-mode: true;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-responsive-layout {
            /* Force tablet layout */
            --tablet-mode: true;
          }
        }

        @media (min-width: 1024px) {
          .mobile-responsive-layout {
            /* Force desktop layout */
            --desktop-mode: true;
          }
        }

        /* Masquer les éléments non essentiels sur mobile */
        @media (max-width: 767px) {
          .mobile-layout .zoom-slider {
            /* Masquer le zoom slider sur mobile */
            display: none !important;
          }
          
          .mobile-layout .auto-responsive-indicator {
            /* Masquer l'indicateur responsive sur mobile */
            display: none !important;
          }
          
          .mobile-layout .performance-monitor {
            /* Masquer le moniteur de performance sur mobile */
            display: none !important;
          }
        }

        /* Forcer l'interactivité de la sidebar mobile (même avec des verrous tactiles) */
        .mobile-sidebar-drawer,
        .mobile-sidebar-drawer *,
        .mobile-sidebar-overlay {
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
};

export default MobileResponsiveLayout;

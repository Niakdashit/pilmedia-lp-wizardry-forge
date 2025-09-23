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
  // Force le type d'appareil pour la mise en page (ex: afficher l'UI mobile en preview desktop)
  forceDeviceType?: 'desktop' | 'tablet' | 'mobile';
  // Appareil sélectionné dans l'UI (utilisé pour forcer l'interface)
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  // Props pour la sidebar mobile
  onAddElement?: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  // Props toolbar mobile (optionnels)
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Permet de vider la sélection quand on clique hors sidebar/canvas
  onClearSelection?: () => void;
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
  forceDeviceType,
  selectedDevice,
  // Props pour la sidebar mobile
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  currentBackground,
  campaignConfig,
  onCampaignConfigChange,
  elements,
  onElementsChange,
  // Props toolbar mobile
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearSelection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  // N'appliquer l'auto-zoom (adjustCanvasZoom) qu'une seule fois
  const hasAppliedInitialZoomRef = useRef(false);

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

  // Forcer le type d'appareil si demandé (ex: preview mobile sur desktop)
  // Priorité: selectedDevice > forceDeviceType > deviceType détecté
  const effectiveForceType = selectedDevice || forceDeviceType;
  const effectiveDeviceType = effectiveForceType || deviceType;
  
  // IMPORTANT: la détection physique reste la source pour activer l'UI mobile
  const mIsMobile = isMobile;
  const mIsTablet = isTablet;
  
  // Détection de la taille de fenêtre pour la responsivité
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const isWindowMobile = windowSize.height > windowSize.width && windowSize.width < 768;

  // Afficher l'UI mobile dans ces cas:
  // 1. Appareil mobile réel (pas tablette)
  // 2. Device selector en mode mobile/tablette (selectedDevice)
  // 3. Force explicite mobile/tablette (forceDeviceType)
  // 4. Fenêtre en format 9:16
  const showMobileUI = mIsMobile || 
                      selectedDevice === 'mobile' || selectedDevice === 'tablet' ||
                      forceDeviceType === 'mobile' || forceDeviceType === 'tablet' ||
                      isWindowMobile;
  
  // Détection de la taille de fenêtre
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  console.log('🔍 Device detection debug:', {
    mIsMobile,
    mIsTablet,
    selectedDevice,
    forceDeviceType,
    showMobileUI,
    effectiveDeviceType,
    isWindowMobile
  });

  // Système de verrouillage du canvas pour mobile
  const {
    isDragging
  } = useMobileCanvasLock({
    canvasRef,
    selectedElement,
    isMobile: mIsMobile,
    isTablet: mIsTablet,
    zoom
  });

  // Gestion de la visibilité de la toolbar mobile
  useEffect(() => {
    if (selectedElement && selectedElement.type !== 'text' && showMobileUI) {
      setIsToolbarVisible(true);
    } else {
      setIsToolbarVisible(false);
    }
  }, [selectedElement, showMobileUI]);

  // Écouteur pour l'ajustement automatique du zoom
  useEffect(() => {
    const handleZoomAdjust = (event: CustomEvent) => {
      if (hasAppliedInitialZoomRef.current) return;
      if (onZoomChange && showMobileUI) {
        hasAppliedInitialZoomRef.current = true;
        onZoomChange(event.detail.zoom);
      }
    };

    window.addEventListener('adjustCanvasZoom', handleZoomAdjust as EventListener);
    return () => {
      window.removeEventListener('adjustCanvasZoom', handleZoomAdjust as EventListener);
    };
  }, [onZoomChange, showMobileUI]);

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
      selectedElement ? 'has-selection' : '',
      showMobileUI ? 'mobile-ui-enabled' : ''
    ].filter(Boolean).join(' ');

    return `${baseClasses} ${deviceClasses[effectiveDeviceType] || 'desktop-layout'} ${stateClasses}`;
  };

  return (
    <div 
      ref={containerRef}
      className={getLayoutClasses()}
      data-device={effectiveDeviceType}
      data-selected-device={selectedDevice}
      data-mobile-optimized={(mIsMobile || mIsTablet).toString()}
      data-show-mobile-ui={showMobileUI.toString()}
      onPointerDownCapture={(e) => {
        // Ne rien faire s'il n'y a rien à désélectionner
        if (!selectedElement || !onClearSelection) return;

        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Ignorer les clics dans la sidebar mobile (drawer) et la barre d'onglets persistante
        const insideSidebar = !!target.closest('.mobile-sidebar-drawer');
        const insideBottomBar = !!target.closest('#mobile-toolbar');
        if (insideSidebar || insideBottomBar) return;

        // Ignorer les clics dans l'UI du canvas (ex: CanvasToolbar, panneaux d'effets/position)
        // Marquée avec l'attribut data-canvas-ui="1"
        const insideCanvasUI = !!target.closest('[data-canvas-ui]');
        if (insideCanvasUI) return;

        // Ignorer les clics à l'intérieur de la toolbar overlay mobile (ne pas perdre la sélection)
        const insideToolbarOverlay = !!target.closest('.mobile-toolbar-overlay');
        if (insideToolbarOverlay) return;

        // Si le clic est à l'intérieur du canvas, laisser la logique du canvas gérer (éléments, fond, etc.)
        const canvasNode = canvasRef?.current;
        if (canvasNode && canvasNode.contains(target)) return;

        // Sinon: clic sur l'arrière-plan/zone grise -> vider la sélection
        onClearSelection();
      }}
    >
      {/* Contenu principal */}
      <div className={`layout-content ${className}`}>
        {children}
      </div>

      {/* Toolbar mobile overlay - s'affiche uniquement pour les éléments non-texte */}
      {isToolbarVisible && showMobileUI && selectedElement && selectedElement.type !== 'text' && onElementUpdate && (
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

      {/* Sidebar mobile drawer - mobile et tablette */}
      {showMobileUI && onAddElement && (
        <MobileSidebarDrawer
          onAddElement={onAddElement}
          onBackgroundChange={onBackgroundChange}
          onExtractedColorsChange={onExtractedColorsChange}
          currentBackground={currentBackground}
          campaignConfig={campaignConfig}
          onCampaignConfigChange={onCampaignConfigChange}
          elements={elements}
          onElementsChange={onElementsChange}
          selectedElement={selectedElement}
          onElementUpdate={onElementUpdate}
          // Undo/redo
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
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
          min-height: 100vh;
          height: 100dvh;
          max-height: 100dvh;
          min-height: 100dvh;

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
          /* Prevent flex children from overflowing in mobile dynamic viewport */
          min-height: 0;
          min-width: 0;
        }

        /* Masquer la sidebar sur mobile - affichée via drawer */
        .mobile-layout .hybrid-sidebar {
          display: none !important;
        }

        /* Afficher la toolbar canvas sur mobile pour le texte (comportement comme PC) */

        /* Ajuster le canvas pour mobile */
        .mobile-layout .design-canvas-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px; /* Minimal padding to prevent edge cropping */
          overflow: hidden;
          position: relative;
          min-height: 0;
          min-width: 0;
          width: 100%;
          height: 100%;
        }
        
        /* Canvas wrapper pour mobile - centrage parfait */
        .mobile-layout .design-canvas-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          flex: 1;
          max-width: calc(100vw - 8px); /* Account for minimal padding */
          max-height: calc(100vh - 120px); /* Account for safe areas and UI */
        }

        /* Canvas bloqué sur mobile - empêcher les interactions non désirées */
        .mobile-layout.is-dragging {
          /* Bloquer tout scroll pendant le drag */
          overflow: hidden;
          touch-action: none;
        }

        /* Scope pointer-events disabling to canvas content only */
        .mobile-layout.is-dragging .design-canvas-container * {
          pointer-events: none;
        }

        .mobile-layout.is-dragging .design-canvas-container [data-element-id] {
          pointer-events: auto;
        }

        /* Keep descendants of elements interactive (e.g., inline editors, inputs) */
        .mobile-layout.is-dragging .design-canvas-container [data-element-id] * {
          pointer-events: auto;
        }

        /* Always allow the inline text editor to receive events while dragging */
        .mobile-layout.is-dragging .design-canvas-container .canvas-text-editor {
          pointer-events: auto !important;
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
        .mobile-layout.is-dragging [class*="sidebar"] {
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

        /* Layout tablette */
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

        /* Masquer la toolbar mobile sur desktop sauf si UI mobile forcée */
        .desktop-layout:not(.mobile-ui-enabled) .mobile-toolbar-overlay {
          display: none !important;
        }

        /* Masquer la sidebar drawer sur desktop sauf si UI mobile forcée */
        .desktop-layout:not(.mobile-ui-enabled) .mobile-sidebar-drawer {
          display: none !important;
        }

        /* La toolbar mobile ne déplace plus le canvas lorsqu'elle apparaît */

        /* Empêcher le zoom accidentel sur iOS */
        .mobile-layout input,
        .mobile-layout textarea,
        .mobile-layout select {
          font-size: 16px !important; /* Empêche le zoom iOS */
          -webkit-appearance: none;
          border-radius: 0;
        }

        /* Préserver la taille réelle du texte pour l'éditeur inline du canvas */
        .mobile-layout input.canvas-text-editor,
        .mobile-layout .canvas-text-editor {
          font-size: inherit !important;
          line-height: inherit !important;
          -webkit-user-select: text !important;
          user-select: text !important;
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
      `}</style>
    </div>
  );
};

export default MobileResponsiveLayout;
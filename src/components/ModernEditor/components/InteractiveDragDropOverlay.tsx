
import React, { useEffect, useRef, useCallback, memo } from 'react';
import { useInteractiveDragDrop } from '../hooks/useInteractiveDragDrop';
import InteractiveCustomElementsRenderer from './InteractiveCustomElementsRenderer';

// Composant mémoïsé pour éviter les rendus inutiles
const DragFeedback = memo(({ isDragging, selectedElementId }: { 
  isDragging: boolean; 
  selectedElementId: string | null 
}) => (
  <>
    {isDragging && (
      <div className="absolute top-2 left-2 bg-blue-500/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg z-50 pointer-events-none backdrop-blur-sm">
        Déplacement en cours...
      </div>
    )}

    {selectedElementId && !isDragging && (
      <div className="absolute top-2 left-2 bg-blue-500/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg z-50 backdrop-blur-sm">
        Élément sélectionné • Appuyez sur Échap pour désélectionner
      </div>
    )}
  </>
));

interface InteractiveDragDropOverlayProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  isEnabled?: boolean;
  children?: React.ReactNode;
}

const InteractiveDragDropOverlay: React.FC<InteractiveDragDropOverlayProps> = ({
  campaign,
  setCampaign,
  previewDevice,
  isEnabled = true,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  
  const {
    dragState,
    selectedElementId,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleElementSelect,
    handleDeselectAll
  } = useInteractiveDragDrop({
    campaign,
    setCampaign,
    containerRef,
    previewDevice
  });

  // Gestion optimisée des événements tactiles
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    // Limiter le taux de rafraîchissement pour les appareils lents (~60fps)
    if (now - lastTouchTimeRef.current < 16) return;
    lastTouchTimeRef.current = now;
    
    handleDragMove(e);
  }, [handleDragMove]);

  // Gestion du toucher final
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    // Détection du double tap pour la sélection
    if (now - lastTouchTimeRef.current < 300) {
      const target = e.target as HTMLElement;
      const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');
      if (elementId) {
        handleElementSelect(elementId);
      }
    }
    
    isDraggingRef.current = false;
    handleDragEnd();
  }, [handleDragEnd, handleElementSelect]);

  // Gestion du début du toucher
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDraggingRef.current = true;
    lastTouchTimeRef.current = Date.now();
    
    // Transmettre l'événement au gestionnaire de drag
    const touch = e.touches[0];
    const fakeMouseEvent = {
      ...e,
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault(),
      stopPropagation: () => e.stopPropagation()
    } as unknown as React.MouseEvent;
    
    const element = e.target as HTMLElement;
    const elementId = element.closest('[data-element-id]')?.getAttribute('data-element-id');
    const elementType = element.closest('[data-element-type]')?.getAttribute('data-element-type') as 'text' | 'image';
    
    if (elementId && elementType) {
      handleDragStart(fakeMouseEvent, elementId, elementType);
    }
  }, [handleDragStart]);

  // Gestion des événements globaux
  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      handleDragEnd();
    };

    // Ajouter les écouteurs pour le mode tactile
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isEnabled, dragState.isDragging, handleDragMove, handleDragEnd, handleTouchMove, handleTouchEnd]);

  // Handle escape key to deselect
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDeselectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleDeselectAll, isEnabled]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDeselectAll();
    }
  };

  if (!isEnabled) {
    return <div className="relative w-full h-full">{children}</div>;
  }

  // Mémoïser la map des tailles pour éviter les recalculs
  const sizeMap = useRef({
    xs: '10px', sm: '12px', base: '14px', lg: '16px',
    xl: '18px', '2xl': '20px', '3xl': '24px', '4xl': '28px',
    '5xl': '32px', '6xl': '36px', '7xl': '48px',
    '8xl': '60px', '9xl': '72px'
  }).current;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden touch-none select-none"
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
      style={{
        cursor: dragState.isDragging ? 'grabbing' : 'default',
        zIndex: 1000,
        // Optimisation pour le rendu matériel
        transform: 'translateZ(0)',
        willChange: 'transform',
        // Désactive les actions tactiles indésirables
        touchAction: 'none',
        // Améliore le rendu sur iOS
        WebkitTapHighlightColor: 'transparent',
        // Assure que les éléments sont correctement positionnés
        position: 'relative'
      }}
    >
      {/* Overlay des éléments interactifs */}
      <div className="relative w-full h-full">
        <InteractiveCustomElementsRenderer
          customTexts={campaign.design?.customTexts || []}
          customImages={campaign.design?.customImages || []}
          previewDevice={previewDevice}
          sizeMap={sizeMap}
          selectedElementId={selectedElementId}
          onElementSelect={handleElementSelect}
          onDragStart={handleDragStart}
          dragState={dragState}
        />
      </div>

      <DragFeedback 
        isDragging={dragState.isDragging} 
        selectedElementId={selectedElementId} 
      />
    </div>
  );
};

export default memo(InteractiveDragDropOverlay);

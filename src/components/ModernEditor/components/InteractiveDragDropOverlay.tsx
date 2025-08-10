
import React, { useEffect, useRef } from 'react';
import { useInteractiveDragDrop } from '../hooks/useInteractiveDragDrop';
import InteractiveCustomElementsRenderer from './InteractiveCustomElementsRenderer';

interface InteractiveDragDropOverlayProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
  isEnabled?: boolean;
  children?: React.ReactNode;
}

const InteractiveDragDropOverlay: React.FC<InteractiveDragDropOverlayProps> = ({
  campaign,
  setCampaign,
  previewDevice = 'desktop',
  isEnabled = true,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // Add global event listeners for drag
  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = handleDragEnd;
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleDragMove(e);
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleDragEnd();
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd, isEnabled]);

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

  const sizeMap: Record<string, string> = {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '36px',
    '7xl': '48px',
    '8xl': '60px',
    '9xl': '72px'
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      onClick={handleContainerClick}
      style={{
        cursor: dragState.isDragging ? 'grabbing' : 'default',
        zIndex: 1000,
        touchAction: 'none' // Empêche le défilement natif
      }}
    >
      {/* Interactive elements overlay */}
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

      {/* Drag feedback - SANS MASQUE FLOU */}
      {dragState.isDragging && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg z-50 pointer-events-none">
          Déplacement en cours...
        </div>
      )}

      {/* Selection indicator */}
      {selectedElementId && !dragState.isDragging && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg z-50">
          Élément sélectionné • Appuyez sur Échap pour désélectionner
        </div>
      )}
    </div>
  );
};

export default InteractiveDragDropOverlay;

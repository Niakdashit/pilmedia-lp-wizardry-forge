import { useCallback, useRef, useState } from 'react';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

interface SimpleDragOptions {
  elementRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  deviceConfig: { x: number; y: number; width?: number; height?: number };
  onUpdate: (updates: any) => void;
  elementId: string | number;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

export const useSimplePreciseDrag = ({
  elementRef,
  containerRef,
  deviceConfig,
  onUpdate,
  elementId,
  previewDevice = 'desktop'
}: SimpleDragOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  } | null>(null);
  
  const deviceDims = getDeviceDimensions(previewDevice);

  const handlePointerStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!elementRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculer l'échelle entre le container physique et les dimensions logiques du device
    const scaleX = containerRect.width / deviceDims.width;
    const scaleY = containerRect.height / deviceDims.height;

    // Position du curseur dans les coordonnées du container
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    // Convertir en coordonnées logiques
    const logicalCursorX = containerX / scaleX;
    const logicalCursorY = containerY / scaleY;

    // Position actuelle de l'élément en coordonnées logiques (from config)
    const currentElementX = deviceConfig.x;
    const currentElementY = deviceConfig.y;

    // L'offset est la différence entre le curseur et la position logique actuelle de l'élément
    const offsetX = logicalCursorX - currentElementX;
    const offsetY = logicalCursorY - currentElementY;

    dragStateRef.current = {
      offsetX,
      offsetY,
      startX: containerX,
      startY: containerY
    };

    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    console.log('🎯 Simple drag start:', {
      elementId,
      previewDevice,
      cursorLogicalPos: { x: logicalCursorX, y: logicalCursorY },
      elementCurrentPos: { x: currentElementX, y: currentElementY },
      offset: { x: offsetX, y: offsetY },
      scales: { scaleX, scaleY },
      deviceConfig,
      deviceDims
    });

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current || !dragStateRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Position actuelle du curseur dans les coordonnées du container
      const currentX = moveEvent.clientX - containerRect.left;
      const currentY = moveEvent.clientY - containerRect.top;

      // Convertir en coordonnées logiques du device
      const scaleX = containerRect.width / deviceDims.width;
      const scaleY = containerRect.height / deviceDims.height;

      // Position logique actuelle du curseur
      const logicalCursorX = currentX / scaleX;
      const logicalCursorY = currentY / scaleY;

      // Nouvelle position de l'élément (curseur logique - offset logique)
      const logicalX = logicalCursorX - dragStateRef.current.offsetX;
      const logicalY = logicalCursorY - dragStateRef.current.offsetY;

      // Appliquer les limites dans l'espace logique
      const elementWidth = deviceConfig.width || 100;
      const elementHeight = deviceConfig.height || 30;
      
      const maxX = Math.max(0, deviceDims.width - elementWidth);
      const maxY = Math.max(0, deviceDims.height - elementHeight);
      
      const constrainedX = Math.min(Math.max(0, logicalX), maxX);
      const constrainedY = Math.min(Math.max(0, logicalY), maxY);

      console.log('📍 Simple drag move:', {
        cursorPhysical: { x: currentX, y: currentY },
        cursorLogical: { x: logicalCursorX, y: logicalCursorY },
        newLogicalPos: { x: logicalX, y: logicalY },
        constrainedPos: { x: constrainedX, y: constrainedY },
        offset: dragStateRef.current,
        scales: { scaleX, scaleY }
      });

      onUpdate({ 
        x: Math.round(constrainedX), 
        y: Math.round(constrainedY) 
      });
    };

    const handlePointerUp = () => {
      console.log('✅ Simple drag ended');
      setIsDragging(false);
      dragStateRef.current = null;

      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  }, [elementRef, containerRef, onUpdate, elementId, deviceConfig, previewDevice, deviceDims]);

  return {
    isDragging,
    handleDragStart: handlePointerStart
  };
};
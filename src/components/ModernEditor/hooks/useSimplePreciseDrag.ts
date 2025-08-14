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
    const elementRect = elementRef.current.getBoundingClientRect();

    // Calculer l'échelle entre le container physique et les dimensions logiques du device
    const scaleX = containerRect.width / deviceDims.width;
    const scaleY = containerRect.height / deviceDims.height;

    // Position du curseur dans les coordonnées du container
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    // Position de l'élément dans les coordonnées du container
    const elementX = elementRect.left - containerRect.left;
    const elementY = elementRect.top - containerRect.top;

    // Calculer l'offset entre le curseur et le coin supérieur gauche de l'élément
    const offsetX = containerX - elementX;
    const offsetY = containerY - elementY;

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
      containerPos: { x: containerX, y: containerY },
      elementPos: { x: elementX, y: elementY },
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

      // Nouvelle position de l'élément (curseur - offset)
      const newElementX = currentX - dragStateRef.current.offsetX;
      const newElementY = currentY - dragStateRef.current.offsetY;

      // Convertir en coordonnées logiques du device
      const scaleX = containerRect.width / deviceDims.width;
      const scaleY = containerRect.height / deviceDims.height;

      const logicalX = newElementX / scaleX;
      const logicalY = newElementY / scaleY;

      // Appliquer les limites dans l'espace logique
      const elementWidth = deviceConfig.width || 100;
      const elementHeight = deviceConfig.height || 30;
      
      const maxX = Math.max(0, deviceDims.width - elementWidth);
      const maxY = Math.max(0, deviceDims.height - elementHeight);
      
      const constrainedX = Math.min(Math.max(0, logicalX), maxX);
      const constrainedY = Math.min(Math.max(0, logicalY), maxY);

      console.log('📍 Simple drag move:', {
        currentPos: { x: currentX, y: currentY },
        newElementPos: { x: newElementX, y: newElementY },
        logicalPos: { x: logicalX, y: logicalY },
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
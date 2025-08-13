import { useState, useCallback, useRef, useEffect } from 'react';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

// Hook pour les dimensions du conteneur avec cache
const useContainerDimensions = (containerRef: React.RefObject<HTMLElement>) => {
  const dimensions = useRef({ width: 0, height: 0 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        dimensions.current = {
          width: rect.width,
          height: rect.height
        };
      }
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [containerRef]);
  
  return dimensions.current;
};

export const useUnifiedElementDrag = (
  elementRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  deviceConfig: { x: number; y: number; width?: number; height?: number },
  onUpdate: (updates: any) => void,
  elementId: string | number,
  previewDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const containerDims = useContainerDimensions(containerRef);
  const deviceDims = useRef(getDeviceDimensions(previewDevice));
  
  // Mise à jour des dimensions du périphérique lors du changement
  useEffect(() => {
    deviceDims.current = getDeviceDimensions(previewDevice);
  }, [previewDevice]);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!containerRef.current || !elementRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = elementRef.current.getBoundingClientRect();
      
      // Calcul des échelles pour la conversion entre coordonnées physiques et logiques
      const scaleX = containerDims.width / deviceDims.current.width;
      const scaleY = containerDims.height / deviceDims.current.height;

      // Position du curseur en coordonnées logiques
      const cursorXLogical = (e.clientX - containerRect.left) / scaleX;
      const cursorYLogical = (e.clientY - containerRect.top) / scaleY;

      // Position de l'élément en coordonnées logiques
      const elLeftLogical = (elementRect.left - containerRect.left) / scaleX;
      const elTopLogical = (elementRect.top - containerRect.top) / scaleY;

      // Calcul de l'offset du curseur par rapport à l'élément
      const offsetX = cursorXLogical - elLeftLogical;
      const offsetY = cursorYLogical - elTopLogical;

      dragStartRef.current = { offsetX, offsetY };
      setIsDragging(true);

      // Set cursor for better UX
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      console.log('🎯 Unified drag start:', {
        elementId,
        previewDevice,
        cursorXLogical,
        cursorYLogical,
        elLeftLogical,
        elTopLogical,
        offsetX,
        offsetY,
        scaleX,
        scaleY,
        containerDims: containerDims,
        deviceDims: deviceDims.current
      });

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!containerRef.current || !dragStartRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calcul des échelles
        const scaleX = containerDims.width / deviceDims.current.width;
        const scaleY = containerDims.height / deviceDims.current.height;

        // Position actuelle du curseur en coordonnées logiques
        const currentXLogical = (moveEvent.clientX - containerRect.left) / scaleX;
        const currentYLogical = (moveEvent.clientY - containerRect.top) / scaleY;

        // Calculer la nouvelle position de l'élément (curseur - offset)
        let newX = currentXLogical - dragStartRef.current.offsetX;
        let newY = currentYLogical - dragStartRef.current.offsetY;

        // Limites dans les coordonnées logiques du device
        const maxX = Math.max(0, deviceDims.current.width - (deviceConfig.width || 100));
        const maxY = Math.max(0, deviceDims.current.height - (deviceConfig.height || 30));
        
        // Appliquer les limites
        newX = Math.min(Math.max(0, newX), maxX);
        newY = Math.min(Math.max(0, newY), maxY);

        console.log('📍 Unified drag move:', {
          mouseX: moveEvent.clientX,
          mouseY: moveEvent.clientY,
          currentXLogical,
          currentYLogical,
          offsetX: dragStartRef.current.offsetX,
          offsetY: dragStartRef.current.offsetY,
          newX,
          newY,
          scaleX,
          scaleY
        });

        onUpdate({ x: Math.round(newX), y: Math.round(newY) });
      };

      const handlePointerUp = () => {
        console.log('✅ Unified drag ended');
        setIsDragging(false);
        dragStartRef.current = null;

        // Reset cursor
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [containerRef, elementRef, onUpdate, elementId, deviceConfig.width, deviceConfig.height, containerDims, previewDevice]
  );

  return {
    isDragging,
    handleDragStart
  };
};
import { useCallback, useRef, useEffect } from 'react';
import { DragState, DragStartMeta } from './types/dragDropTypes';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

interface UseDragHandlersProps {
  dragState: DragState;
  dragStartRef: React.MutableRefObject<DragStartMeta>;
  updateDragState: (newState: Partial<DragState>) => void;
  resetDragState: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  setCampaign: (updater: (prev: any) => any) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setSelectedElementId: (id: string | null) => void;
}

// Optimisation: cache pour les dimensions du conteneur
const useContainerDimensions = (containerRef: React.RefObject<HTMLDivElement>) => {
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

export const useDragHandlers = ({
  dragState,
  dragStartRef,
  updateDragState,
  resetDragState,
  containerRef,
  setCampaign,
  previewDevice,
  setSelectedElementId
}: UseDragHandlersProps) => {
  const rafId = useRef<number>();
  const lastMoveTime = useRef(0);
  const containerDims = useContainerDimensions(containerRef);
  const deviceDims = useRef(getDeviceDimensions(previewDevice));
  
  // Mise à jour des dimensions du périphérique lors du changement
  useEffect(() => {
    deviceDims.current = getDeviceDimensions(previewDevice);
  }, [previewDevice]);
  
  // Nettoyage de l'animation frame à la fin du composant
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const handleDragStart = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    elementId: string,
    elementType: 'text' | 'image'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Désactiver le défilement pendant le drag
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Drag start for element:', elementId, 'type:', elementType);
    }

    const touchEvent = 'touches' in e;
    const clientX = touchEvent ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = touchEvent ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (!containerRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No container ref');
      }
      return;
    }

    // Get container and scale info
    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = containerDims.width / deviceDims.current.width;
    const scaleY = containerDims.height / deviceDims.current.height;

    // Calculate cursor position in logical coordinates
    const cursorXLogical = (clientX - containerRect.left) / scaleX;
    const cursorYLogical = (clientY - containerRect.top) / scaleY;

    // Get element dimensions
    const targetEl = e.currentTarget as HTMLElement;
    const elRect = targetEl.getBoundingClientRect();
    const elementWidth = elRect.width / scaleX;
    const elementHeight = elRect.height / scaleY;

    // Calculate element's current position in logical coordinates
    const elLeftLogical = (elRect.left - containerRect.left) / scaleX;
    const elTopLogical = (elRect.top - containerRect.top) / scaleY;

    // Calculate offset from cursor to element's top-left corner
    const offsetX = cursorXLogical - elLeftLogical;
    const offsetY = cursorYLogical - elTopLogical;

    console.log('📍 Drag start calculated:', { 
      cursorXLogical, 
      cursorYLogical, 
      elLeftLogical, 
      elTopLogical, 
      offsetX, 
      offsetY, 
      elementWidth, 
      elementHeight,
      scaleX,
      scaleY
    });

    dragStartRef.current = {
      x: Math.round(cursorXLogical),
      y: Math.round(cursorYLogical),
      offsetX,
      offsetY,
      elementWidth,
      elementHeight
    };
    
    setSelectedElementId(elementId);
    updateDragState({
      isDragging: true,
      draggedElementId: elementId,
      draggedElementType: elementType,
      startPosition: { x: Math.round(cursorXLogical), y: Math.round(cursorYLogical) },
      currentOffset: { x: 0, y: 0 }
    });

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [containerRef, dragStartRef, updateDragState, setSelectedElementId, containerDims, deviceDims]);

  const updateElementPosition = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging || !containerRef.current || !dragState.draggedElementId) return;
    
    // Use requestAnimationFrame for smooth updates
    rafId.current = requestAnimationFrame(() => {
      const now = Date.now();
      // Limit to ~60 FPS
      if (now - lastMoveTime.current < 16) return;
      lastMoveTime.current = now;
      
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      // Simplified scale calculation
      const scaleX = containerDims.width / deviceDims.current.width;
      const scaleY = containerDims.height / deviceDims.current.height;

      // Calculate logical positions
      const currentXLogical = (clientX - containerRect.left) / scaleX;
      const currentYLogical = (clientY - containerRect.top) / scaleY;

      const { offsetX = 0, offsetY = 0, elementWidth = 0, elementHeight = 0 } = dragStartRef.current || ({} as DragStartMeta);

      // Calculate new position 
      let newX = currentXLogical - offsetX;
      let newY = currentYLogical - offsetY;

      // Clamp within logical device bounds
      const maxX = Math.max(0, deviceDims.current.width - elementWidth);
      const maxY = Math.max(0, deviceDims.current.height - elementHeight);
      
      // Apply bounds 
      newX = Math.min(Math.max(0, newX), maxX);
      newY = Math.min(Math.max(0, newY), maxY);

      setCampaign((prev: any) => {
        const design = prev.design || {};
        const arrayKey = dragState.draggedElementType === 'text' ? 'customTexts' : 'customImages';
        const elements = design[arrayKey] || [];
        
        const updatedElements = elements.map((element: any) => {
          const numericElementId = typeof dragState.draggedElementId === 'string' 
            ? parseInt(dragState.draggedElementId) 
            : dragState.draggedElementId;
          
          if (element.id === numericElementId) {
            const updatedPosition = { 
              x: Math.round(newX), // Position entière pour éviter les sauts
              y: Math.round(newY)
            };
            
            if (previewDevice !== 'desktop') {
              return {
                ...element,
                [previewDevice]: {
                  ...element[previewDevice],
                  ...updatedPosition
                }
              };
            } else {
              return {
                ...element,
                ...updatedPosition
              };
            }
          }
          return element;
        });

        return {
          ...prev,
          design: {
            ...design,
            [arrayKey]: updatedElements
          },
          _lastUpdate: now
        };
      });
    });
  }, [dragState, containerRef, setCampaign, previewDevice, dragStartRef, containerDims]);
  
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touchEvent = 'touches' in e;
    const clientX = touchEvent ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = touchEvent ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    if (!containerRef.current) return;
    
    // Simplified scale calculation
    const containerRect = containerRef.current.getBoundingClientRect();
    const scaleX = containerDims.width / deviceDims.current.width;
    const scaleY = containerDims.height / deviceDims.current.height;
    
    // Calculate position
    const currentXLogical = (clientX - containerRect.left) / scaleX;
    const currentYLogical = (clientY - containerRect.top) / scaleY;
    
    // Update state with current position
    updateDragState({
      currentPosition: {
        x: currentXLogical,
        y: currentYLogical
      }
    });
    
    // Update element position
    updateElementPosition(clientX, clientY);
  }, [containerRef, updateElementPosition, updateDragState, containerDims, deviceDims]);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;
    
    // Annuler le prochain frame en attente
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = undefined;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Drag ended', dragState);
    }
    
    // Utiliser directement les dernières coordonnées connues du drag
    const lastPosition = dragState.currentPosition || dragState.startPosition;
    
    if (dragState.draggedElementId && lastPosition) {
      setCampaign((prev: any) => {
        const design = prev.design || {};
        const arrayKey = dragState.draggedElementType === 'text' ? 'customTexts' : 'customImages';
        const elements = design[arrayKey] || [];
        
        const updatedElements = elements.map((element: any) => {
          const numericElementId = typeof dragState.draggedElementId === 'string' 
            ? parseInt(dragState.draggedElementId) 
            : dragState.draggedElementId;
          
          if (element.id === numericElementId) {
            const updatedPosition = {
              x: Math.round(lastPosition.x),
              y: Math.round(lastPosition.y)
            };
            
            if (previewDevice !== 'desktop') {
              return {
                ...element,
                [previewDevice]: {
                  ...(element[previewDevice] || {}),
                  ...updatedPosition
                }
              };
            } else {
              return {
                ...element,
                ...updatedPosition
              };
            }
          }
          return element;
        });
        
        const updatedDesign = {
          ...design,
          [arrayKey]: updatedElements
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Updating element position:', {
            elementId: dragState.draggedElementId,
            position: lastPosition,
            design: updatedDesign
          });
        }
        
        return {
          ...prev,
          design: updatedDesign,
          _lastUpdate: Date.now()
        };
      });
    }
    
    // Réinitialiser les styles avec un léger délai pour s'assurer que la mise à jour est terminée
    setTimeout(() => {
      resetDragState();
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }, 50);
  }, [dragState, setCampaign, previewDevice, resetDragState]);

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd
  };
};
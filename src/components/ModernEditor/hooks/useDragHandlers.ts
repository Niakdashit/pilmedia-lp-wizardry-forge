
import { useCallback } from 'react';
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
  const handleDragStart = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    elementId: string,
    elementType: 'text' | 'image'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🎯 Drag start for element:', elementId, 'type:', elementType);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (!containerRef.current) {
      console.log('❌ No container ref');
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();

    // Determine preview scale between logical device coords and rendered pixels
    const deviceDims = getDeviceDimensions(previewDevice);
    const scaleX = containerRect.width / deviceDims.width;
    const scaleY = containerRect.height / deviceDims.height;

    const startXLogical = (clientX - containerRect.left) / scaleX;
    const startYLogical = (clientY - containerRect.top) / scaleY;

    // Compute grab offset relative to element's top-left in logical coords
    const targetEl = e.currentTarget as HTMLElement;
    const elRect = targetEl.getBoundingClientRect();
    const elLeftLogical = (elRect.left - containerRect.left) / scaleX;
    const elTopLogical = (elRect.top - containerRect.top) / scaleY;
    const offsetX = startXLogical - elLeftLogical;
    const offsetY = startYLogical - elTopLogical;

    const elementWidth = elRect.width / scaleX;
    const elementHeight = elRect.height / scaleY;

    console.log('📍 Drag start (logical):', { startXLogical, startYLogical, offsetX, offsetY, elementWidth, elementHeight, scaleX, scaleY });

    dragStartRef.current = {
      x: Math.round(startXLogical),
      y: Math.round(startYLogical),
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
      startPosition: { x: Math.round(startXLogical), y: Math.round(startYLogical) },
      currentOffset: { x: 0, y: 0 }
    });

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [containerRef, dragStartRef, updateDragState, setSelectedElementId]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !containerRef.current || !dragState.draggedElementId) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const containerRect = containerRef.current.getBoundingClientRect();

    // Recompute scale to convert pointer (screen) to logical device coords
    const deviceDims = getDeviceDimensions(previewDevice);
    const scaleX = containerRect.width / deviceDims.width;
    const scaleY = containerRect.height / deviceDims.height;

    const currentXLogical = (clientX - containerRect.left) / scaleX;
    const currentYLogical = (clientY - containerRect.top) / scaleY;

    const { offsetX = 0, offsetY = 0, elementWidth = 0, elementHeight = 0 } = dragStartRef.current || ({} as DragStartMeta);

    let newX = currentXLogical - offsetX;
    let newY = currentYLogical - offsetY;

    // Clamp within logical device bounds
    const maxX = Math.max(0, Math.round(deviceDims.width - elementWidth));
    const maxY = Math.max(0, Math.round(deviceDims.height - elementHeight));
    newX = Math.min(Math.max(0, Math.round(newX)), maxX);
    newY = Math.min(Math.max(0, Math.round(newY)), maxY);

    setCampaign((prev: any) => {
      const design = prev.design || {};
      const arrayKey = dragState.draggedElementType === 'text' ? 'customTexts' : 'customImages';
      const elements = design[arrayKey] || [];
      
      const updatedElements = elements.map((element: any) => {
        const numericElementId = typeof dragState.draggedElementId === 'string' 
          ? parseInt(dragState.draggedElementId) 
          : dragState.draggedElementId;
        
        if (element.id === numericElementId) {
          if (previewDevice !== 'desktop') {
            return {
              ...element,
              [previewDevice]: {
                ...element[previewDevice],
                x: newX,
                y: newY
              }
            };
          } else {
            return {
              ...element,
              x: newX,
              y: newY
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
        _lastUpdate: Date.now()
      };
    });
  }, [dragState, containerRef, setCampaign, previewDevice, dragStartRef]);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    console.log('✅ Drag ended');

    resetDragState();
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    // Rétablir le défilement
    document.body.style.overflow = '';
  }, [dragState.isDragging, resetDragState]);

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd
  };
};

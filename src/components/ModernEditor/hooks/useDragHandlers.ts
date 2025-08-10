
import { useCallback } from 'react';
import { DragState, DragStartMeta } from './types/dragDropTypes';

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

    // Work in SCREEN pixels to match DOM and avoid any scale mismatch
    const startX = clientX - containerRect.left;
    const startY = clientY - containerRect.top;

    // Compute grab offset relative to element's top-left (screen px)
    const targetEl = e.currentTarget as HTMLElement;
    const elRect = targetEl.getBoundingClientRect();
    const elLeft = elRect.left - containerRect.left;
    const elTop = elRect.top - containerRect.top;
    const offsetX = startX - elLeft;
    const offsetY = startY - elTop;

    const elementWidth = elRect.width;
    const elementHeight = elRect.height;

    console.log('📍 Drag start (screen):', { startX, startY, offsetX, offsetY, elementWidth, elementHeight });

    dragStartRef.current = {
      x: Math.round(startX),
      y: Math.round(startY),
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
      startPosition: { x: Math.round(startX), y: Math.round(startY) },
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

    const currentX = (clientX - containerRect.left);
    const currentY = (clientY - containerRect.top);

    const { offsetX = 0, offsetY = 0, elementWidth = 0, elementHeight = 0 } = dragStartRef.current || ({} as DragStartMeta);

    let newX = currentX - offsetX;
    let newY = currentY - offsetY;

    // Clamp within SCREEN/container bounds
    const maxX = Math.max(0, Math.round(containerRect.width - elementWidth));
    const maxY = Math.max(0, Math.round(containerRect.height - elementHeight));
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

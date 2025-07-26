
import { useCallback } from 'react';
import { DragState } from './types/dragDropTypes';

interface UseDragHandlersProps {
  dragState: DragState;
  dragStartRef: React.MutableRefObject<{ x: number; y: number }>;
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

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!containerRef.current) {
      console.log('❌ No container ref');
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = clientX - containerRect.left;
    const startY = clientY - containerRect.top;

    console.log('📍 Drag start position:', { startX, startY });

    dragStartRef.current = { x: startX, y: startY };
    setSelectedElementId(elementId);
    updateDragState({
      isDragging: true,
      draggedElementId: elementId,
      draggedElementType: elementType,
      startPosition: { x: startX, y: startY },
      currentOffset: { x: 0, y: 0 }
    });

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [containerRef, dragStartRef, updateDragState, setSelectedElementId]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !containerRef.current || !dragState.draggedElementId) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = clientX - containerRect.left;
    const currentY = clientY - containerRect.top;

    const newX = Math.max(0, currentX);
    const newY = Math.max(0, currentY);

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
                x: Math.round(newX),
                y: Math.round(newY)
              }
            };
          } else {
            return {
              ...element,
              x: Math.round(newX),
              y: Math.round(newY)
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
  }, [dragState, containerRef, setCampaign, previewDevice]);

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

import { useState, useCallback, useRef } from 'react';
import { throttle } from 'lodash-es';

interface DragState {
  isDragging: boolean;
  draggedElementId: string | null;
  draggedElementType: 'text' | 'image' | null;
  startPosition: { x: number; y: number };
  currentOffset: { x: number; y: number };
}

interface UseInteractiveDragDropProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

export const useInteractiveDragDrop = ({
  campaign,
  setCampaign,
  containerRef,
  previewDevice
}: UseInteractiveDragDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElementId: null,
    draggedElementType: null,
    startPosition: { x: 0, y: 0 },
    currentOffset: { x: 0, y: 0 }
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Throttled position update for smooth performance
  const throttledUpdate = useCallback(
    throttle((elementId: string, elementType: 'text' | 'image', newX: number, newY: number) => {
      setCampaign((prev: any) => {
        const design = prev.design || {};
        const arrayKey = elementType === 'text' ? 'customTexts' : 'customImages';
        const elements = design[arrayKey] || [];
        
        const updatedElements = elements.map((element: any) => {
          if (element.id === elementId) {
            // Update device-specific or global position
            if (previewDevice !== 'desktop') {
              return {
                ...element,
                [previewDevice]: {
                  ...element[previewDevice],
                  x: Math.max(0, Math.round(newX)),
                  y: Math.max(0, Math.round(newY))
                }
              };
            } else {
              return {
                ...element,
                x: Math.max(0, Math.round(newX)),
                y: Math.max(0, Math.round(newY))
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
    }, 16), // ~60fps
    [setCampaign, previewDevice]
  );

  const handleDragStart = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    elementId: string,
    elementType: 'text' | 'image'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const startX = clientX - containerRect.left;
    const startY = clientY - containerRect.top;

    dragStartRef.current = { x: startX, y: startY };
    setSelectedElementId(elementId);
    setDragState({
      isDragging: true,
      draggedElementId: elementId,
      draggedElementType: elementType,
      startPosition: { x: startX, y: startY },
      currentOffset: { x: 0, y: 0 }
    });

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [containerRef]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = clientX - containerRect.left;
    const currentY = clientY - containerRect.top;

    const offsetX = currentX - dragStartRef.current.x;
    const offsetY = currentY - dragStartRef.current.y;

    setDragState(prev => ({
      ...prev,
      currentOffset: { x: offsetX, y: offsetY }
    }));

    // Get current element position
    const design = campaign.design || {};
    const arrayKey = dragState.draggedElementType === 'text' ? 'customTexts' : 'customImages';
    const elements = design[arrayKey] || [];
    const element = elements.find((el: any) => el.id === dragState.draggedElementId);
    
    if (element) {
      const deviceConfig = previewDevice !== 'desktop' && element[previewDevice] 
        ? element[previewDevice] 
        : element;
      
      const currentElementX = deviceConfig.x || 0;
      const currentElementY = deviceConfig.y || 0;
      
      const newX = currentElementX + offsetX;
      const newY = currentElementY + offsetY;

      throttledUpdate(dragState.draggedElementId!, dragState.draggedElementType!, newX, newY);
    }
  }, [dragState, containerRef, campaign, throttledUpdate, previewDevice]);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    setDragState({
      isDragging: false,
      draggedElementId: null,
      draggedElementType: null,
      startPosition: { x: 0, y: 0 },
      currentOffset: { x: 0, y: 0 }
    });

    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [dragState.isDragging]);

  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElementId(selectedElementId === elementId ? null : elementId);
  }, [selectedElementId]);

  const handleDeselectAll = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  return {
    dragState,
    selectedElementId,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleElementSelect,
    handleDeselectAll
  };
};
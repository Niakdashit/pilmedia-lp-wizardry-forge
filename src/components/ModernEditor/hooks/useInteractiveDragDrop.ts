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
          // Convert elementId to number for comparison
          const numericElementId = typeof elementId === 'string' ? parseInt(elementId) : elementId;
          if (element.id === numericElementId) {
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

    // Calculate the new position directly based on mouse position
    // Get current element position
    const design = campaign.design || {};
    const arrayKey = dragState.draggedElementType === 'text' ? 'customTexts' : 'customImages';
    const elements = design[arrayKey] || [];
    const numericDraggedId = typeof dragState.draggedElementId === 'string' 
      ? parseInt(dragState.draggedElementId) 
      : dragState.draggedElementId;
    const element = elements.find((el: any) => el.id === numericDraggedId);
    
    if (element) {
      const deviceConfig = previewDevice !== 'desktop' && element[previewDevice] 
        ? element[previewDevice] 
        : element;
      
      const elementRect = document.querySelector(`[data-element-id="${dragState.draggedElementId}"]`);
      let offsetX = 0;
      let offsetY = 0;
      
      if (elementRect) {
        const rect = elementRect.getBoundingClientRect();
        offsetX = currentX - (rect.left - containerRect.left + rect.width / 2);
        offsetY = currentY - (rect.top - containerRect.top + rect.height / 2);
      }
      
      const newX = Math.max(0, currentX - offsetX);
      const newY = Math.max(0, currentY - offsetY);

      console.log('🚀 Moving element to:', { newX, newY });

      setDragState(prev => ({
        ...prev,
        currentOffset: { x: newX - (deviceConfig.x || 0), y: newY - (deviceConfig.y || 0) }
      }));

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
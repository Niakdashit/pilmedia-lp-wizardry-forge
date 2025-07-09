import { useState, useCallback, useRef } from 'react';

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
    if (!dragState.isDragging || !containerRef.current || !dragState.draggedElementId) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = clientX - containerRect.left;
    const currentY = clientY - containerRect.top;

    // Calculate new absolute position (follow mouse exactly)
    const newX = Math.max(0, currentX);
    const newY = Math.max(0, currentY);

    // Update position immediately without throttling for instant feedback
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

    setDragState({
      isDragging: false,
      draggedElementId: null,
      draggedElementType: null,
      startPosition: { x: 0, y: 0 },
      currentOffset: { x: 0, y: 0 }
    });

    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Reset drag start ref
    dragStartRef.current = { x: 0, y: 0 };
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
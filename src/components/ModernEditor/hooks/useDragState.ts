
import { useState, useRef } from 'react';
import { DragState, DragStartMeta } from './types/dragDropTypes';

export const useDragState = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElementId: null,
    draggedElementType: null,
    startPosition: { x: 0, y: 0 },
    currentOffset: { x: 0, y: 0 }
  });

  const dragStartRef = useRef<DragStartMeta>({ x: 0, y: 0, offsetX: 0, offsetY: 0, elementWidth: 0, elementHeight: 0 });

  const updateDragState = (newState: Partial<DragState>) => {
    setDragState(prev => ({ ...prev, ...newState }));
  };

  const resetDragState = () => {
    setDragState({
      isDragging: false,
      draggedElementId: null,
      draggedElementType: null,
      startPosition: { x: 0, y: 0 },
      currentOffset: { x: 0, y: 0 }
    });
    dragStartRef.current = { x: 0, y: 0, offsetX: 0, offsetY: 0, elementWidth: 0, elementHeight: 0 };
  };

  return {
    dragState,
    dragStartRef,
    updateDragState,
    resetDragState
  };
};

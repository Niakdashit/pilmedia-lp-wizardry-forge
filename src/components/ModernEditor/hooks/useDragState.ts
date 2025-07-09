
import { useState, useRef } from 'react';
import { DragState } from './types/dragDropTypes';

export const useDragState = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElementId: null,
    draggedElementType: null,
    startPosition: { x: 0, y: 0 },
    currentOffset: { x: 0, y: 0 }
  });

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
    dragStartRef.current = { x: 0, y: 0 };
  };

  return {
    dragState,
    dragStartRef,
    updateDragState,
    resetDragState
  };
};

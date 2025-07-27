import { useState, useCallback, useRef } from 'react';

interface UseCanvasInteractionsProps {
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  selectedElements: string[];
  setSelectedElements: (ids: string[]) => void;
  setSelectionBox: (box: any) => void;
  setSnapGuides: (guides: any[]) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  addToHistory: (elements: any[]) => void;
}

export const useCanvasInteractions = ({
  elements,
  setSelectionBox,
  canvasRef,
  addToHistory
}: UseCanvasInteractionsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const draggedElementRef = useRef<any>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Click on canvas background - start selection box
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        setSelectionBox({
          startX,
          startY,
          endX: startX,
          endY: startY
        });
      }
    }
  }, [canvasRef, setSelectionBox]);

  const handleMouseMove = useCallback((_e: React.MouseEvent) => {
    // Handle selection box dragging
    // This would be implemented with proper selection logic
  }, []);

  const handleMouseUp = useCallback(() => {
    setSelectionBox(null);
    if (isDragging) {
      setIsDragging(false);
      addToHistory(elements);
    }
  }, [isDragging, setSelectionBox, addToHistory, elements]);

  const handleDragStart = useCallback((e: React.MouseEvent, element: any) => {
    e.preventDefault();
    setIsDragging(true);
    // setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
    draggedElementRef.current = element;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Handle drop logic
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDragStart,
    handleDrop,
    isDragging,
    dragOffset
  };
};
import { useCallback, useRef, useEffect } from 'react';
import { throttle } from 'lodash-es';
import { useEditorStore } from '@/stores/editorStore';

interface UseOptimizedDragDropProps {
  containerRef: React.RefObject<HTMLElement>;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

export const useOptimizedDragDrop = ({
  containerRef,
  previewDevice
}: UseOptimizedDragDropProps) => {
  const {
    dragState,
    updateDragState,
    resetDragState,
    setCampaign,
    selectedElementId,
    handleElementSelect,
    handleDeselectAll
  } = useEditorStore();

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  // Throttled drag move with requestAnimationFrame for 60fps
  const throttledDragMove = useCallback(
    throttle((clientX: number, clientY: number) => {
      if (!dragState.isDragging || !containerRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const newX = clientX - containerRect.left - dragStartRef.current.x;
        const newY = clientY - containerRect.top - dragStartRef.current.y;

        updateDragState({
          currentOffset: { x: newX, y: newY }
        });

        // Update campaign with optimized batching
        if (dragState.draggedElementId && dragState.draggedElementType) {
          setCampaign((prev: any) => {
            const deviceKey = previewDevice; // 'desktop', 'tablet', 'mobile'
            const customTexts = prev.design?.customTexts || {};
            const customImages = prev.design?.customImages || {};

            const updatedTexts = { ...customTexts };
            const updatedImages = { ...customImages };

            // Update text element position
            if (dragState.draggedElementId && updatedTexts[dragState.draggedElementId]) {
              updatedTexts[dragState.draggedElementId] = {
                ...updatedTexts[dragState.draggedElementId],
                [deviceKey]: {
                  ...updatedTexts[dragState.draggedElementId][deviceKey],
                  x: Math.max(0, newX),
                  y: Math.max(0, newY)
                }
              };
            }

            // Update image element position
            if (dragState.draggedElementId && updatedImages[dragState.draggedElementId]) {
              updatedImages[dragState.draggedElementId] = {
                ...updatedImages[dragState.draggedElementId],
                [deviceKey]: {
                  ...updatedImages[dragState.draggedElementId][deviceKey],
                  x: Math.max(0, newX),
                  y: Math.max(0, newY)
                }
              };
            }

            return {
              ...prev,
              design: {
                ...prev.design,
                customTexts: updatedTexts,
                customImages: updatedImages
              }
            };
          });
        }
      });
    }, 16), // 60fps = ~16ms
    [dragState.isDragging, dragState.draggedElementId, previewDevice, containerRef, updateDragState, setCampaign]
  );

  const handleDragStart = useCallback((
    elementId: string,
    elementType: string,
    clientX: number,
    clientY: number
  ) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - containerRect.left;
    const offsetY = clientY - containerRect.top;

    dragStartRef.current = { x: offsetX, y: offsetY };

    updateDragState({
      isDragging: true,
      draggedElementId: elementId,
      draggedElementType: elementType,
      startPosition: { x: offsetX, y: offsetY },
      currentOffset: { x: 0, y: 0 }
    });

    // Set cursor styles for better UX
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [containerRef, updateDragState]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    throttledDragMove(clientX, clientY);
  }, [throttledDragMove]);

  const handleDragEnd = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    resetDragState();
    
    // Reset cursor styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [resetDragState]);

  // Enhanced element selection with snapping
  const handleElementSelectWithSnapping = useCallback((elementId: string) => {
    handleElementSelect(elementId);
    // No visual pulse feedback per clean UI guidelines
  }, [handleElementSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      throttledDragMove.cancel();
    };
  }, [throttledDragMove]);

  return {
    dragState,
    selectedElementId,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleElementSelect: handleElementSelectWithSnapping,
    handleDeselectAll
  };
};
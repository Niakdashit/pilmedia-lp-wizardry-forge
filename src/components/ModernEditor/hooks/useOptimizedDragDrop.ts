import { useCallback, useRef, useEffect } from 'react';
import { throttle } from 'lodash-es';
import { useEditorStore } from '@/stores/editorStore';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

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
  // Store grab offset relative to the element (logical coords) and its size for bounds
  const dragStartRef = useRef<{ 
    offsetX: number; 
    offsetY: number; 
    elementWidth: number; 
    elementHeight: number;
  }>({ offsetX: 0, offsetY: 0, elementWidth: 0, elementHeight: 0 });
  const rafRef = useRef<number>();

  // Throttled drag move with requestAnimationFrame for 60fps
  const throttledDragMove = useCallback(
    throttle((clientX: number, clientY: number) => {
      if (!dragState.isDragging || !containerRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const deviceDims = getDeviceDimensions(previewDevice);
        const scaleX = containerRect.width / deviceDims.width;
        const scaleY = containerRect.height / deviceDims.height;
        // Use uniform scaling with potential letterboxing (contain)
        const scale = Math.min(scaleX, scaleY);
        const contentWidth = deviceDims.width * scale;
        const contentHeight = deviceDims.height * scale;
        const contentLeft = containerRect.left + (containerRect.width - contentWidth) / 2;
        const contentTop = containerRect.top + (containerRect.height - contentHeight) / 2;

        // Pointer in logical device coords
        const currentXLogical = (clientX - contentLeft) / scale;
        const currentYLogical = (clientY - contentTop) / scale;

        const { offsetX, offsetY, elementWidth, elementHeight } = dragStartRef.current;

        // Absolute new position in logical coords (cursor minus grab offset)
        let newX = currentXLogical - offsetX;
        let newY = currentYLogical - offsetY;

        // Clamp to device bounds accounting for element size
        const maxX = Math.max(0, Math.round(deviceDims.width - elementWidth));
        const maxY = Math.max(0, Math.round(deviceDims.height - elementHeight));
        newX = Math.min(Math.max(0, Math.round(newX)), maxX);
        newY = Math.min(Math.max(0, Math.round(newY)), maxY);

        // We update the absolute position directly; keep transform offset zero to avoid double movement
        updateDragState({ currentOffset: { x: 0, y: 0 } });

        if (dragState.draggedElementId && dragState.draggedElementType) {
          setCampaign((prev: any) => {
            const design = prev.design || {};
            const arrayKey = dragState.draggedElementType === 'text' ? 'customTexts' : 'customImages';
            const elements = design[arrayKey] ?? [];

            const numericId = typeof dragState.draggedElementId === 'string'
              ? parseInt(dragState.draggedElementId)
              : dragState.draggedElementId;

            let updatedElements: any;

            if (Array.isArray(elements)) {
              updatedElements = elements.map((el: any) => {
                if (el.id === numericId) {
                  if (previewDevice !== 'desktop') {
                    return {
                      ...el,
                      [previewDevice]: {
                        ...el[previewDevice],
                        x: newX,
                        y: newY
                      }
                    };
                  }
                  return { ...el, x: newX, y: newY };
                }
                return el;
              });
            } else {
              // Object map shape fallback
              updatedElements = { ...elements };
              const key = String(numericId);
              if (updatedElements[key]) {
                if (previewDevice !== 'desktop') {
                  updatedElements[key] = {
                    ...updatedElements[key],
                    [previewDevice]: {
                      ...updatedElements[key][previewDevice],
                      x: newX,
                      y: newY
                    }
                  };
                } else {
                  updatedElements[key] = { ...updatedElements[key], x: newX, y: newY };
                }
              }
            }

            return {
              ...prev,
              design: {
                ...design,
                [arrayKey]: updatedElements
              },
              _lastUpdate: Date.now()
            };
          });
        }
      });
    }, 16),
    [dragState.isDragging, dragState.draggedElementId, dragState.draggedElementType, previewDevice, containerRef, updateDragState, setCampaign]
  );

  const handleDragStart = useCallback((
    elementId: string,
    elementType: string,
    clientX: number,
    clientY: number
  ) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const deviceDims = getDeviceDimensions(previewDevice);
    const scaleX = containerRect.width / deviceDims.width;
    const scaleY = containerRect.height / deviceDims.height;
    const scale = Math.min(scaleX, scaleY);
    const contentWidth = deviceDims.width * scale;
    const contentHeight = deviceDims.height * scale;
    const contentLeft = containerRect.left + (containerRect.width - contentWidth) / 2;
    const contentTop = containerRect.top + (containerRect.height - contentHeight) / 2;

    const element = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement | null;
    const elRect = element?.getBoundingClientRect();

    const startXLogical = (clientX - contentLeft) / scale;
    const startYLogical = (clientY - contentTop) / scale;

    const elLeftLogical = elRect ? (elRect.left - contentLeft) / scale : startXLogical;
    const elTopLogical = elRect ? (elRect.top - contentTop) / scale : startYLogical;

    const offsetX = startXLogical - elLeftLogical;
    const offsetY = startYLogical - elTopLogical;

    dragStartRef.current = {
      offsetX,
      offsetY,
      elementWidth: elRect ? elRect.width / scale : 0,
      elementHeight: elRect ? elRect.height / scale : 0
    };

    updateDragState({
      isDragging: true,
      draggedElementId: elementId,
      draggedElementType: elementType as any,
      startPosition: { x: Math.round(startXLogical), y: Math.round(startYLogical) },
      currentOffset: { x: 0, y: 0 }
    });

    // Set cursor styles for better UX
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [containerRef, previewDevice, updateDragState]);

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
    
    // Add visual feedback
    const element = document.querySelector(`[data-element-id="${elementId}"]`);
    if (element) {
      element.classList.add('animate-pulse');
      setTimeout(() => {
        element.classList.remove('animate-pulse');
      }, 200);
    }
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
import { useState, useCallback, useRef } from 'react';

export const useUnifiedElementDrag = (
  elementRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  deviceConfig: { x: number; y: number; width?: number; height?: number },
  onUpdate: (updates: any) => void,
  elementId: string | number
) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!containerRef.current || !elementRef.current) {
        return;
      }

      const elementRect = elementRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate offset from click point to element's top-left corner
      const offsetX = e.clientX - elementRect.left;
      const offsetY = e.clientY - elementRect.top;

      dragStartRef.current = { offsetX, offsetY };
      setIsDragging(true);

      // Set cursor for better UX
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      console.log('🎯 Drag start:', {
        elementId,
        clickX: e.clientX,
        clickY: e.clientY,
        elementLeft: elementRect.left,
        elementTop: elementRect.top,
        offsetX,
        offsetY,
        containerLeft: containerRect.left,
        containerTop: containerRect.top
      });

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!containerRef.current || !dragStartRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate new position by subtracting the initial offset
        const newX = moveEvent.clientX - containerRect.left - dragStartRef.current.offsetX;
        const newY = moveEvent.clientY - containerRect.top - dragStartRef.current.offsetY;

        // Clamp within container bounds
        const clampedX = Math.max(0, Math.min(newX, containerRect.width - (deviceConfig.width || 100)));
        const clampedY = Math.max(0, Math.min(newY, containerRect.height - (deviceConfig.height || 30)));

        console.log('📍 Drag move:', {
          mouseX: moveEvent.clientX,
          mouseY: moveEvent.clientY,
          containerLeft: containerRect.left,
          containerTop: containerRect.top,
          offsetX: dragStartRef.current.offsetX,
          offsetY: dragStartRef.current.offsetY,
          newX,
          newY,
          clampedX,
          clampedY
        });

        onUpdate({ x: Math.round(clampedX), y: Math.round(clampedY) });
      };

      const handlePointerUp = () => {
        console.log('✅ Drag ended');
        setIsDragging(false);
        dragStartRef.current = null;

        // Reset cursor
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [containerRef, elementRef, onUpdate, elementId, deviceConfig.width, deviceConfig.height]
  );

  return {
    isDragging,
    handleDragStart
  };
};
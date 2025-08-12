
import { useState, useCallback, useRef } from 'react';
import { useSmartSnapping } from './useSmartSnapping';

export const useImageElementDrag = (
  elementRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  deviceConfig: any,
  onUpdate: (updates: any) => void,
  elementId: string | number
) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const { applySnapping } = useSmartSnapping({ containerRef });

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!containerRef.current || !elementRef.current) {
        return;
      }

      const elementRect = elementRef.current.getBoundingClientRect();

      const offsetX = e.clientX - elementRect.left;
      const offsetY = e.clientY - elementRect.top;

      dragStartRef.current = { offsetX, offsetY };
      setIsDragging(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!containerRef.current || !dragStartRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        let newX = moveEvent.clientX - containerRect.left - dragStartRef.current.offsetX;
        let newY = moveEvent.clientY - containerRect.top - dragStartRef.current.offsetY;

        const snapped = applySnapping(newX, newY, deviceConfig.width, deviceConfig.height, String(elementId));
        newX = snapped.x;
        newY = snapped.y;

        const alignmentEvent = new CustomEvent('showAlignmentGuides', {
          detail: { elementId, guides: snapped.guides, isDragging: true }
        });
        document.dispatchEvent(alignmentEvent);

        onUpdate({ x: newX, y: newY });
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;

        const hideGuidesEvent = new CustomEvent('hideAlignmentGuides');
        document.dispatchEvent(hideGuidesEvent);

        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    },
    [containerRef, elementRef, applySnapping, onUpdate, elementId, deviceConfig.width, deviceConfig.height]
  );

  return {
    isDragging,
    handleDragStart
  };
};

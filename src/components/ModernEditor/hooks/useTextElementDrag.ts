
import { useState, useCallback, useRef } from 'react';

export const useTextElementDrag = (
  elementRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  deviceConfig: any,
  onUpdate: (updates: any) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{offsetX: number, offsetY: number} | null>(null);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Starting text drag for element:', deviceConfig);

    if (!containerRef.current || !elementRef.current) {
      console.log('Missing refs:', { container: !!containerRef.current, element: !!elementRef.current });
      return;
    }

    const elementRect = elementRef.current.getBoundingClientRect();
    
    // Calculate offset relative to container
    const offsetX = e.clientX - elementRect.left;
    const offsetY = e.clientY - elementRect.top;
    
    console.log('Drag start - offset:', { offsetX, offsetY });
    
    dragStartRef.current = { offsetX, offsetY };
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current || !dragStartRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementWidth = elementRef.current?.offsetWidth || 0;
      const elementHeight = elementRef.current?.offsetHeight || 0;
      
      let newX = moveEvent.clientX - containerRect.left - dragStartRef.current.offsetX;
      let newY = moveEvent.clientY - containerRect.top - dragStartRef.current.offsetY;
      
      // Snap to alignment guides
      const snapTolerance = 8;
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      const elementCenterX = newX + elementWidth / 2;
      const elementCenterY = newY + elementHeight / 2;
      
      // Snap to center
      if (Math.abs(elementCenterX - centerX) <= snapTolerance) {
        newX = centerX - elementWidth / 2;
      }
      if (Math.abs(elementCenterY - centerY) <= snapTolerance) {
        newY = centerY - elementHeight / 2;
      }
      
      // Constrain to container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - elementWidth));
      newY = Math.max(0, Math.min(newY, containerRect.height - elementHeight));
      
      console.log('Moving text to:', { newX, newY });
      
      // Dispatch custom event with alignment info for guides
      const alignmentEvent = new CustomEvent('showAlignmentGuides', {
        detail: {
          elementId: deviceConfig.id,
          x: newX,
          y: newY,
          width: elementWidth,
          height: elementHeight,
          isDragging: true
        }
      });
      document.dispatchEvent(alignmentEvent);
      
      // Update immediately for real-time feedback
      onUpdate({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      console.log('Text drag ended');
      setIsDragging(false);
      dragStartRef.current = null;
      
      // Hide alignment guides
      const hideGuidesEvent = new CustomEvent('hideAlignmentGuides');
      document.dispatchEvent(hideGuidesEvent);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [containerRef, deviceConfig, onUpdate]);

  return {
    isDragging,
    handleDragStart
  };
};


import { useState, useCallback, useRef } from 'react';

export const useImageElementDrag = (
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
    
    console.log('Starting image drag for element:', deviceConfig);

    if (!containerRef.current || !elementRef.current) {
      console.log('Missing refs:', { container: !!containerRef.current, element: !!elementRef.current });
      return;
    }

    const elementRect = elementRef.current.getBoundingClientRect();
    
    const offsetX = e.clientX - elementRect.left;
    const offsetY = e.clientY - elementRect.top;
    
    console.log('Drag start - offset:', { offsetX, offsetY });
    
    dragStartRef.current = { offsetX, offsetY };
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current || !dragStartRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newX = moveEvent.clientX - containerRect.left - dragStartRef.current.offsetX;
      let newY = moveEvent.clientY - containerRect.top - dragStartRef.current.offsetY;
      
      // Constrain to container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - deviceConfig.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - deviceConfig.height));
      
      console.log('Moving image to:', { newX, newY });
      
      // Update immediately for real-time feedback
      onUpdate({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      console.log('Image drag ended');
      setIsDragging(false);
      dragStartRef.current = null;
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

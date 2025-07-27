import { useState, useCallback } from 'react';

export const useElementResize = (element: any, onUpdate: (id: string, updates: any) => void) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandles] = useState({
    nw: { cursor: 'nw-resize' },
    ne: { cursor: 'ne-resize' },
    sw: { cursor: 'sw-resize' },
    se: { cursor: 'se-resize' },
    n: { cursor: 'n-resize' },
    s: { cursor: 's-resize' },
    w: { cursor: 'w-resize' },
    e: { cursor: 'e-resize' }
  });

  const handleResizeStart = useCallback((handle: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width || 100;
    const startHeight = element.height || 50;
    const startPosX = element.x;
    const startPosY = element.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      switch (handle) {
        case 'se': // Southeast
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'sw': // Southwest
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          newX = startPosX + deltaX;
          break;
        case 'ne': // Northeast
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newY = startPosY + deltaY;
          break;
        case 'nw': // Northwest
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newX = startPosX + deltaX;
          newY = startPosY + deltaY;
          break;
        case 'n': // North
          newHeight = Math.max(20, startHeight - deltaY);
          newY = startPosY + deltaY;
          break;
        case 's': // South
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'w': // West
          newWidth = Math.max(20, startWidth - deltaX);
          newX = startPosX + deltaX;
          break;
        case 'e': // East
          newWidth = Math.max(20, startWidth + deltaX);
          break;
      }

      onUpdate(element.id, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [element, onUpdate]);

  return {
    isResizing,
    handleResizeStart,
    resizeHandles
  };
};
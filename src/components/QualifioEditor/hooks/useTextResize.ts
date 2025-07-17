
import { useState, useCallback, useRef } from 'react';

export const useTextResize = (
  text: any,
  onUpdate: (updates: any) => void
) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startFontSize: number;
    handle: string;
    aspectRatio: number;
  } | null>(null);

  const handleResizeStart = useCallback((handle: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = text.width || 200;
    const startHeight = text.height || 50;
    const startFontSize = text.fontSize || 16;
    const aspectRatio = startWidth / startHeight;

    resizeStartRef.current = {
      startX,
      startY,
      startWidth,
      startHeight,
      startFontSize,
      handle,
      aspectRatio
    };
    
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const { startX, startY, startWidth, startHeight, startFontSize, handle, aspectRatio } = resizeStartRef.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = text.x;
      let newY = text.y;

      // Calculate new dimensions based on handle
      switch (handle) {
        case 'se': // Bottom-right
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          newX = text.x + (startWidth - newWidth);
          break;
        case 'ne': // Top-right
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newY = text.y + (startHeight - newHeight);
          break;
        case 'nw': // Top-left
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newX = text.x + (startWidth - newWidth);
          newY = text.y + (startHeight - newHeight);
          break;
        case 'n': // Top
          newHeight = Math.max(20, startHeight - deltaY);
          newY = text.y + deltaY;
          break;
        case 's': // Bottom
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'w': // Left
          newWidth = Math.max(50, startWidth - deltaX);
          newX = text.x + deltaX;
          break;
        case 'e': // Right
          newWidth = Math.max(50, startWidth + deltaX);
          break;
      }

      // Calculer la nouvelle taille de police proportionnellement
      const scaleFactor = Math.min(newWidth / startWidth, newHeight / startHeight);
      const newFontSize = Math.max(8, Math.min(72, startFontSize * scaleFactor));

      onUpdate({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        fontSize: newFontSize
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [text, onUpdate]);

  return {
    isResizing,
    handleResizeStart
  };
};

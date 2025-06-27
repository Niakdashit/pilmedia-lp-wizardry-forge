
import { useState, useCallback, useRef } from 'react';

export const useImageElementResize = (
  containerRef: React.RefObject<HTMLDivElement>,
  deviceConfig: any,
  onUpdate: (updates: any) => void,
  aspectRatioLocked: boolean
) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    handle: string;
    aspectRatio: number;
  } | null>(null);

  const handleResizeStart = useCallback((handle: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = deviceConfig.width;
    const startHeight = deviceConfig.height;
    const aspectRatio = startWidth / startHeight;

    resizeStartRef.current = {
      startX,
      startY,
      startWidth,
      startHeight,
      handle,
      aspectRatio
    };
    
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current || !containerRef.current) return;

      const { startX, startY, startWidth, startHeight, handle, aspectRatio: ratio } = resizeStartRef.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = deviceConfig.x;
      let newY = deviceConfig.y;

      // Calculate new dimensions based on handle
      switch (handle) {
        case 'se': // Bottom-right
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = aspectRatioLocked ? newWidth / ratio : Math.max(20, startHeight + deltaY);
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = aspectRatioLocked ? newWidth / ratio : Math.max(20, startHeight + deltaY);
          newX = deviceConfig.x + (startWidth - newWidth);
          break;
        case 'ne': // Top-right
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = aspectRatioLocked ? newWidth / ratio : Math.max(20, startHeight - deltaY);
          newY = aspectRatioLocked ? deviceConfig.y + (startHeight - newHeight) : deviceConfig.y + deltaY;
          break;
        case 'nw': // Top-left
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = aspectRatioLocked ? newWidth / ratio : Math.max(20, startHeight - deltaY);
          newX = deviceConfig.x + (startWidth - newWidth);
          newY = aspectRatioLocked ? deviceConfig.y + (startHeight - newHeight) : deviceConfig.y + deltaY;
          break;
        case 'n': // Top
          newHeight = Math.max(20, startHeight - deltaY);
          newWidth = aspectRatioLocked ? newHeight * ratio : startWidth;
          newY = deviceConfig.y + deltaY;
          if (aspectRatioLocked) {
            newX = deviceConfig.x + (startWidth - newWidth) / 2;
          }
          break;
        case 's': // Bottom
          newHeight = Math.max(20, startHeight + deltaY);
          newWidth = aspectRatioLocked ? newHeight * ratio : startWidth;
          if (aspectRatioLocked) {
            newX = deviceConfig.x + (startWidth - newWidth) / 2;
          }
          break;
        case 'w': // Left
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = aspectRatioLocked ? newWidth / ratio : startHeight;
          newX = deviceConfig.x + deltaX;
          if (aspectRatioLocked) {
            newY = deviceConfig.y + (startHeight - newHeight) / 2;
          }
          break;
        case 'e': // Right
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = aspectRatioLocked ? newWidth / ratio : startHeight;
          if (aspectRatioLocked) {
            newY = deviceConfig.y + (startHeight - newHeight) / 2;
          }
          break;
      }

      // Constrain to container bounds
      const containerRect = containerRef.current.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, containerRect.width - newWidth));
      newY = Math.max(0, Math.min(newY, containerRect.height - newHeight));

      onUpdate({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
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
  }, [containerRef, deviceConfig, onUpdate, aspectRatioLocked]);

  return {
    isResizing,
    handleResizeStart
  };
};

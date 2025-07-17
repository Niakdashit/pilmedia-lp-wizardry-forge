
import { useState, useCallback } from 'react';
import type { CustomText } from '../QualifioEditorLayout';

interface UseTextResizeProps {
  minFontSize?: number;
  maxFontSize?: number;
  step?: number;
}

export const useTextResize = (
  text: CustomText,
  onUpdate: (text: CustomText) => void,
  options: UseTextResizeProps = {}
) => {
  const { minFontSize = 8, maxFontSize = 72, step = 1 } = options;
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((handle: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = text.width || 200;
      const startHeight = text.height || 100;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        // Handle different resize handles
        switch (handle) {
          case 'se':
          case 'e':
            newWidth = Math.max(50, startWidth + deltaX);
            if (handle === 'se') {
              newHeight = Math.max(20, startHeight + deltaY);
            }
            break;
          case 'sw':
          case 'w':
            newWidth = Math.max(50, startWidth - deltaX);
            if (handle === 'sw') {
              newHeight = Math.max(20, startHeight + deltaY);
            }
            break;
          case 'ne':
          case 'n':
            newHeight = Math.max(20, startHeight - deltaY);
            if (handle === 'ne') {
              newWidth = Math.max(50, startWidth + deltaX);
            }
            break;
          case 'nw':
            newWidth = Math.max(50, startWidth - deltaX);
            newHeight = Math.max(20, startHeight - deltaY);
            break;
          case 's':
            newHeight = Math.max(20, startHeight + deltaY);
            break;
        }

        onUpdate({
          ...text,
          width: newWidth,
          height: newHeight
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  }, [text, onUpdate]);

  const resizeText = useCallback((
    element: HTMLElement, 
    containerWidth: number, 
    containerHeight: number
  ) => {
    if (!element) return;

    let currentSize = text.fontSize;
    element.style.fontSize = `${currentSize}px`;

    // Increase font size until text overflows
    while (
      element.scrollWidth <= containerWidth && 
      element.scrollHeight <= containerHeight && 
      currentSize < maxFontSize
    ) {
      currentSize += step;
      element.style.fontSize = `${currentSize}px`;
    }

    // Decrease if we overflowed, but respect minimum font size
    if (element.scrollWidth > containerWidth || element.scrollHeight > containerHeight) {
      currentSize = Math.max(minFontSize, currentSize - step);
      element.style.fontSize = `${currentSize}px`;
    }

    onUpdate({ ...text, fontSize: currentSize });
  }, [text, minFontSize, maxFontSize, step, onUpdate]);

  return {
    isResizing,
    handleResizeStart,
    resizeText
  };
};

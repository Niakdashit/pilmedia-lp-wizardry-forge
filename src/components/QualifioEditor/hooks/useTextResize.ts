
import { useState, useCallback } from 'react';

interface UseTextResizeProps {
  minFontSize?: number;
  maxFontSize?: number;
  step?: number;
}

export const useTextResize = ({
  minFontSize = 8,
  maxFontSize = 72,
  step = 1
}: UseTextResizeProps = {}) => {
  const [fontSize, setFontSize] = useState(16);

  const increaseFontSize = useCallback(() => {
    setFontSize(current => Math.min(current + step, maxFontSize));
  }, [step, maxFontSize]);

  const decreaseFontSize = useCallback(() => {
    setFontSize(current => Math.max(current - step, minFontSize));
  }, [step, minFontSize]);

  const setFontSizeValue = useCallback((size: number) => {
    const clampedSize = Math.max(minFontSize, Math.min(size, maxFontSize));
    setFontSize(clampedSize);
  }, [minFontSize, maxFontSize]);

  const resizeText = useCallback((
    element: HTMLElement, 
    containerWidth: number, 
    containerHeight: number
  ) => {
    if (!element) return;

    let currentSize = fontSize;
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

    // Decrease if we overflowed
    if (element.scrollWidth > containerWidth || element.scrollHeight > containerHeight) {
      currentSize -= step;
      element.style.fontSize = `${currentSize}px`;
    }

    setFontSize(currentSize);
  }, [fontSize, maxFontSize, step]);

  return {
    fontSize,
    setFontSize: setFontSizeValue,
    increaseFontSize,
    decreaseFontSize,
    resizeText
  };
};

import { useCallback, useRef, useState } from 'react';

interface PinchResizeOptions {
  onResize: (scaleX: number, scaleY: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  minScale?: number;
  maxScale?: number;
  maintainAspectRatio?: boolean;
}

export const usePinchResize = ({
  onResize,
  onResizeStart,
  onResizeEnd,
  minScale = 0.5,
  maxScale = 3,
  maintainAspectRatio = true
}: PinchResizeOptions) => {
  const [isPinching, setIsPinching] = useState(false);
  const initialDistanceRef = useRef<number>(0);
  
  const lastTouchesRef = useRef<TouchList | null>(null);

  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsPinching(true);
      initialDistanceRef.current = getDistance(e.touches);
      lastTouchesRef.current = e.touches;
      
      onResizeStart?.();
      
      console.log('🤏 Pinch resize started');
    }
  }, [getDistance, onResizeStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && isPinching && initialDistanceRef.current > 0) {
      e.preventDefault();
      e.stopPropagation();
      
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialDistanceRef.current;
      
      // Appliquer les limites de scale
      const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
      
      if (maintainAspectRatio) {
        onResize(clampedScale, clampedScale);
      } else {
        // Calculer les scales différentiels pour X et Y
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const lastTouch1 = lastTouchesRef.current?.[0];
        const lastTouch2 = lastTouchesRef.current?.[1];
        
        if (lastTouch1 && lastTouch2) {
          const currentDx = Math.abs(touch1.clientX - touch2.clientX);
          const currentDy = Math.abs(touch1.clientY - touch2.clientY);
          const lastDx = Math.abs(lastTouch1.clientX - lastTouch2.clientX);
          const lastDy = Math.abs(lastTouch1.clientY - lastTouch2.clientY);
          
          const scaleX = lastDx > 0 ? currentDx / lastDx : 1;
          const scaleY = lastDy > 0 ? currentDy / lastDy : 1;
          
          const clampedScaleX = Math.max(minScale, Math.min(maxScale, scaleX));
          const clampedScaleY = Math.max(minScale, Math.min(maxScale, scaleY));
          
          onResize(clampedScaleX, clampedScaleY);
        }
      }
      
      lastTouchesRef.current = e.touches;
    }
  }, [getDistance, isPinching, minScale, maxScale, maintainAspectRatio, onResize]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (isPinching && e.touches.length < 2) {
      setIsPinching(false);
      initialDistanceRef.current = 0;
      lastTouchesRef.current = null;
      
      onResizeEnd?.();
      
      console.log('🤏 Pinch resize ended');
    }
  }, [isPinching, onResizeEnd]);

  const attachListeners = useCallback((element: HTMLElement) => {
    if (!element) return;

    // Utiliser les options passive: false pour pouvoir preventDefault
    const options = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPinching,
    attachListeners
  };
};
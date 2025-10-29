import { useEffect, useCallback, useRef } from 'react';
import { isRealMobile } from '../../../utils/isRealMobile';

interface UseMobileCanvasLockOptions {
  canvasRef: React.RefObject<HTMLDivElement>;
  selectedElement?: any;
  isMobile: boolean;
  isTablet: boolean;
  zoom?: number;
}

export const useMobileCanvasLock = ({
  canvasRef,
  isMobile,
  isTablet
}: UseMobileCanvasLockOptions) => {
  const isRealDevice = isRealMobile();
  const isMobileDevice = isMobile || isTablet || isRealDevice;
  const isDraggingRef = useRef(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastAdjustmentRef = useRef<{
    viewportWidth: number;
    viewportHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    appliedZoom: number;
  } | null>(null);

  // Helper: whether the canvas is currently running a marquee selection
  const isMarqueeActive = () => !!canvasRef.current?.getAttribute('data-marquee');

  // Fonction pour bloquer les interactions non désirées sur le canvas
  const preventCanvasInterference = useCallback((event: TouchEvent | MouseEvent) => {
    if (!canvasRef.current || !isMobileDevice) return;

    // Do not block interactions while marquee selection is active
    if (isMarqueeActive()) return;

    const target = event.target as HTMLElement;
    
    // Permettre les interactions sur les éléments sélectionnables
    const isSelectableElement = target.closest('[data-element-id]') || 
                               target.closest('.mobile-toolbar-overlay') ||
                               target.closest('.canvas-toolbar') ||
                               target.closest('button') ||
                               target.closest('input') ||
                               target.closest('select') ||
                               target.closest('textarea') ||
                               target.closest('[contenteditable="true"]');

    // Si c'est un élément sélectionnable, ne pas bloquer
    if (isSelectableElement) {
      return;
    }

    // Bloquer les interactions sur le canvas vide pour éviter les déplacements accidentels
    const isOnCanvas = target === canvasRef.current || canvasRef.current.contains(target);

    if (isOnCanvas && !isSelectableElement) {
      // Permettre le tap simple pour désélectionner
      if (event.type === 'touchstart' || event.type === 'mousedown') {
        const touch = 'touches' in event ? event.touches[0] : event as MouseEvent;
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
        return;
      }

      // Bloquer les mouvements sur le canvas vide
      if (event.type === 'touchmove' || event.type === 'mousemove') {
        if (lastTouchRef.current) {
          const touch = 'touches' in event ? event.touches[0] : event as MouseEvent;
          const deltaX = Math.abs(touch.clientX - lastTouchRef.current.x);
          const deltaY = Math.abs(touch.clientY - lastTouchRef.current.y);
          
          // Si le mouvement est significatif, bloquer
          if (deltaX > 5 || deltaY > 5) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }

      // Nettoyer la référence au touchend
      if (event.type === 'touchend' || event.type === 'mouseup') {
        lastTouchRef.current = null;
      }
    }
  }, [canvasRef, isMobileDevice]);

  // Fonction pour empêcher le scroll du canvas pendant le drag d'éléments
  const preventScrollDuringDrag = useCallback((event: TouchEvent) => {
    if (!canvasRef.current || !isMobileDevice) return;

    // Do not block scrolling/gestures specifically for marquee selection
    if (isMarqueeActive()) return;

    const target = event.target as HTMLElement;
    const isDraggableElement = target.closest('[data-element-id]');

    if (isDraggableElement && event.touches.length === 1) {
      // Empêcher le scroll pendant le drag d'éléments
      if (isDraggingRef.current) {
        event.preventDefault();
      }
    }
  }, [canvasRef, isMobileDevice]);

  // Fonction pour gérer le début du drag
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;

    // Bloquer le scroll du body pendant le drag
    if (isMobileDevice) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
  }, [isMobileDevice]);

  // Fonction pour gérer la fin du drag
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;

    // Restaurer le scroll du body
    if (isMobileDevice) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [isMobileDevice]);

  // Fonction pour assurer la visibilité complète du canvas
  const ensureCanvasVisibility = useCallback((options: { force?: boolean } = {}) => {
    if (!canvasRef.current || !isMobileDevice) return;

    const { force = false } = options;
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();

    if (canvasRect.width === 0 || canvasRect.height === 0) {
      return;
    }

    const viewport = window.visualViewport;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportWidth = viewport?.width ?? window.innerWidth;

    const wrapper = canvas.closest('.design-canvas-wrapper') as HTMLElement | null;
    const containerRect = wrapper?.getBoundingClientRect() ?? canvas.parentElement?.getBoundingClientRect();

    const availableWidth = Math.max(
      0,
      Math.min(containerRect?.width ?? viewportWidth, viewportWidth)
    );
    const availableHeight = Math.max(
      0,
      Math.min(containerRect?.height ?? viewportHeight, viewportHeight)
    );

    const horizontalPadding = 32;
    const verticalPadding = 48;

    const targetWidth = Math.max(availableWidth - horizontalPadding, 0);
    const targetHeight = Math.max(availableHeight - verticalPadding, 0);

    const scaleX = targetWidth > 0 ? targetWidth / canvasRect.width : 1;
    const scaleY = targetHeight > 0 ? targetHeight / canvasRect.height : 1;
    const optimalZoom = Math.min(scaleX, scaleY, 1);

    const previous = lastAdjustmentRef.current;
    const hasChanged =
      force ||
      !previous ||
      Math.abs(previous.viewportWidth - viewportWidth) > 1 ||
      Math.abs(previous.viewportHeight - viewportHeight) > 1 ||
      Math.abs(previous.canvasWidth - canvasRect.width) > 1 ||
      Math.abs(previous.canvasHeight - canvasRect.height) > 1 ||
      Math.abs(previous.appliedZoom - optimalZoom) > 0.01;

    if (!hasChanged) {
      return;
    }

    lastAdjustmentRef.current = {
      viewportWidth,
      viewportHeight,
      canvasWidth: canvasRect.width,
      canvasHeight: canvasRect.height,
      appliedZoom: optimalZoom
    };

    const fitsWithoutScaling =
      canvasRect.width <= targetWidth &&
      canvasRect.height <= targetHeight;

    if (!fitsWithoutScaling || optimalZoom < 0.999) {
      const clampedZoom = Math.max(Math.min(optimalZoom, 1), 0.1);
      const adjustZoomEvent = new CustomEvent('adjustCanvasZoom', {
        detail: { zoom: clampedZoom }
      });
      window.dispatchEvent(adjustZoomEvent);
    }
  }, [canvasRef, isMobileDevice]);

  // Installation des écouteurs d'événements
  useEffect(() => {
    if (!canvasRef.current || !isMobileDevice) return;

    const canvas = canvasRef.current;

    // Wrappers typed for TS compatibility
    const onTouchStart = (e: TouchEvent) => preventCanvasInterference(e);
    const onTouchMove = (e: TouchEvent) => preventCanvasInterference(e);
    const onTouchEnd = (e: TouchEvent) => preventCanvasInterference(e);
    const onMouseDownCanvas = (e: MouseEvent) => preventCanvasInterference(e);
    const onMouseMoveCanvas = (e: MouseEvent) => preventCanvasInterference(e);
    const onMouseUpCanvas = (e: MouseEvent) => preventCanvasInterference(e);

    // Écouteurs pour bloquer les interactions non désirées
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('mousedown', onMouseDownCanvas);
    canvas.addEventListener('mousemove', onMouseMoveCanvas);
    canvas.addEventListener('mouseup', onMouseUpCanvas);

    // Écouteur pour empêcher le scroll pendant le drag
    canvas.addEventListener('touchmove', preventScrollDuringDrag, { passive: false });

    // Écouteurs globaux pour le drag d'éléments
    const handleGlobalTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Ignore global drag start while marquee selection is active
      if (isMarqueeActive()) return;
      // Ignore touches starting on editable controls
      const isEditable = target.closest('input, textarea, [contenteditable="true"]');
      if (isEditable) return;
      // Do not force drag when interacting with text elements
      const isText = !!target.closest('[data-element-type="text"]');
      if (isText) return;
      if (target.closest('[data-element-id]')) {
        handleDragStart();
      }
    };

    const handleGlobalTouchEnd = () => {
      handleDragEnd();
    };

    const handleGlobalMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore global drag start while marquee selection is active
      if (isMarqueeActive()) return;
      // Ignore mouse down on editable controls
      const isEditable = target.closest('input, textarea, [contenteditable="true"]');
      if (isEditable) return;
      // Do not force drag when interacting with text elements
      const isText = !!target.closest('[data-element-type="text"]');
      if (isText) return;
      if (target.closest('[data-element-id]')) {
        handleDragStart();
      }
    };

    document.addEventListener('touchstart', handleGlobalTouchStart);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('mousedown', handleGlobalMouseDown);
    document.addEventListener('mouseup', handleGlobalTouchEnd);

    return () => {
      // Nettoyage
      canvas.removeEventListener('touchstart', onTouchStart, false);
      canvas.removeEventListener('touchmove', onTouchMove, false);
      canvas.removeEventListener('touchend', onTouchEnd, false);
      canvas.removeEventListener('mousedown', onMouseDownCanvas);
      canvas.removeEventListener('mousemove', onMouseMoveCanvas);
      canvas.removeEventListener('mouseup', onMouseUpCanvas);
      canvas.removeEventListener('touchmove', preventScrollDuringDrag, false);

      document.removeEventListener('touchstart', handleGlobalTouchStart);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('mousedown', handleGlobalMouseDown);
      document.removeEventListener('mouseup', handleGlobalTouchEnd);

      // Restaurer le scroll si nécessaire
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [canvasRef, isMobileDevice, preventCanvasInterference, preventScrollDuringDrag, handleDragStart, handleDragEnd]);

  // Vérifier la visibilité du canvas lors des changements
  useEffect(() => {
    ensureCanvasVisibility({ force: true });
  }, [ensureCanvasVisibility]);

  // Vérifier la visibilité lors du redimensionnement
  useEffect(() => {
    if (!isMobileDevice) return;

    const handleResize = () => {
      lastAdjustmentRef.current = null;
      setTimeout(() => ensureCanvasVisibility({ force: true }), 100); // Délai pour laisser le temps au redimensionnement
    };

    const handleOrientationChange = () => {
      lastAdjustmentRef.current = null;
      setTimeout(() => ensureCanvasVisibility({ force: true }), 300); // Délai plus long pour l'orientation
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobileDevice, ensureCanvasVisibility]);

  useEffect(() => {
    if (!isMobileDevice) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleViewportChange = () => {
      lastAdjustmentRef.current = null;
      ensureCanvasVisibility({ force: true });
    };

    viewport.addEventListener('resize', handleViewportChange);
    viewport.addEventListener('scroll', handleViewportChange);

    return () => {
      viewport.removeEventListener('resize', handleViewportChange);
      viewport.removeEventListener('scroll', handleViewportChange);
    };
  }, [isMobileDevice, ensureCanvasVisibility]);

  useEffect(() => {
    if (!isMobileDevice || !canvasRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const canvas = canvasRef.current;
    const wrapper = canvas.closest('.design-canvas-wrapper') as HTMLElement | null;
    const observer = new ResizeObserver(() => {
      lastAdjustmentRef.current = null;
      ensureCanvasVisibility({ force: true });
    });

    observer.observe(canvas);
    if (wrapper) {
      observer.observe(wrapper);
    }

    return () => {
      observer.disconnect();
    };
  }, [canvasRef, isMobileDevice, ensureCanvasVisibility]);

  return {
    isDragging: isDraggingRef.current,
    ensureCanvasVisibility,
    handleDragStart,
    handleDragEnd
  };
};

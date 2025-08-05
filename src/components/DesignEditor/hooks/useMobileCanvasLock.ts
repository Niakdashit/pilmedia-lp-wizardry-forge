import { useEffect, useCallback, useRef } from 'react';

interface UseMobileCanvasLockOptions {
  canvasRef: React.RefObject<HTMLDivElement>;
  selectedElement?: any;
  isMobile: boolean;
  isTablet: boolean;
  zoom: number;
}

export const useMobileCanvasLock = ({
  canvasRef,
  selectedElement,
  isMobile,
  isTablet,
  zoom
}: UseMobileCanvasLockOptions) => {
  const isDraggingRef = useRef(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Fonction pour bloquer les interactions non désirées sur le canvas
  const preventCanvasInterference = useCallback((event: TouchEvent | MouseEvent) => {
    if (!canvasRef.current || (!isMobile && !isTablet)) return;

    const target = event.target as HTMLElement;
    
    // Permettre les interactions sur les éléments sélectionnables
    const isSelectableElement = target.closest('[data-element-id]') || 
                               target.closest('.mobile-toolbar-overlay') ||
                               target.closest('.canvas-toolbar') ||
                               target.closest('button') ||
                               target.closest('input') ||
                               target.closest('select');

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
  }, [canvasRef, isMobile, isTablet]);

  // Fonction pour empêcher le scroll du canvas pendant le drag d'éléments
  const preventScrollDuringDrag = useCallback((event: TouchEvent) => {
    if (!canvasRef.current || (!isMobile && !isTablet)) return;

    const target = event.target as HTMLElement;
    const isDraggableElement = target.closest('[data-element-id]');

    if (isDraggableElement && event.touches.length === 1) {
      // Empêcher le scroll pendant le drag d'éléments
      if (isDraggingRef.current) {
        event.preventDefault();
      }
    }
  }, [canvasRef, isMobile, isTablet]);

  // Fonction pour gérer le début du drag
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    
    // Bloquer le scroll du body pendant le drag
    if (isMobile || isTablet) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
  }, [isMobile, isTablet]);

  // Fonction pour gérer la fin du drag
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    
    // Restaurer le scroll du body
    if (isMobile || isTablet) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [isMobile, isTablet]);

  // Fonction pour assurer la visibilité complète du canvas
  const ensureCanvasVisibility = useCallback(() => {
    if (!canvasRef.current || (!isMobile && !isTablet)) return;

    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Vérifier si le canvas est entièrement visible
    const isFullyVisible = 
      canvasRect.top >= 0 && 
      canvasRect.left >= 0 && 
      canvasRect.bottom <= viewportHeight && 
      canvasRect.right <= viewportWidth;

    if (!isFullyVisible) {
      // Ajuster le zoom pour que le canvas soit entièrement visible
      const scaleX = (viewportWidth - 40) / canvasRect.width; // 40px de marge
      const scaleY = (viewportHeight - 100) / canvasRect.height; // 100px pour l'interface
      const optimalZoom = Math.min(scaleX, scaleY, 1); // Ne pas zoomer au-delà de 100%

      // Émettre un événement pour ajuster le zoom
      const adjustZoomEvent = new CustomEvent('adjustCanvasZoom', {
        detail: { zoom: optimalZoom }
      });
      window.dispatchEvent(adjustZoomEvent);
    }
  }, [canvasRef, isMobile, isTablet]);

  // Installation des écouteurs d'événements
  useEffect(() => {
    if (!canvasRef.current || (!isMobile && !isTablet)) return;

    const canvas = canvasRef.current;

    // Écouteurs pour bloquer les interactions non désirées
    canvas.addEventListener('touchstart', preventCanvasInterference, { passive: false });
    canvas.addEventListener('touchmove', preventCanvasInterference, { passive: false });
    canvas.addEventListener('touchend', preventCanvasInterference, { passive: false });
    canvas.addEventListener('mousedown', preventCanvasInterference);
    canvas.addEventListener('mousemove', preventCanvasInterference);
    canvas.addEventListener('mouseup', preventCanvasInterference);

    // Écouteur pour empêcher le scroll pendant le drag
    canvas.addEventListener('touchmove', preventScrollDuringDrag, { passive: false });

    // Écouteurs globaux pour le drag d'éléments
    const handleGlobalTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-element-id]')) {
        handleDragStart();
      }
    };

    const handleGlobalTouchEnd = () => {
      handleDragEnd();
    };

    document.addEventListener('touchstart', handleGlobalTouchStart);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-element-id]')) {
        handleDragStart();
      }
    });
    document.addEventListener('mouseup', handleGlobalTouchEnd);

    return () => {
      // Nettoyage
      canvas.removeEventListener('touchstart', preventCanvasInterference);
      canvas.removeEventListener('touchmove', preventCanvasInterference);
      canvas.removeEventListener('touchend', preventCanvasInterference);
      canvas.removeEventListener('mousedown', preventCanvasInterference);
      canvas.removeEventListener('mousemove', preventCanvasInterference);
      canvas.removeEventListener('mouseup', preventCanvasInterference);
      canvas.removeEventListener('touchmove', preventScrollDuringDrag);

      document.removeEventListener('touchstart', handleGlobalTouchStart);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('mouseup', handleGlobalTouchEnd);

      // Restaurer le scroll si nécessaire
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [canvasRef, isMobile, isTablet, preventCanvasInterference, preventScrollDuringDrag, handleDragStart, handleDragEnd]);

  // Vérifier la visibilité du canvas lors des changements
  useEffect(() => {
    ensureCanvasVisibility();
  }, [selectedElement, zoom, ensureCanvasVisibility]);

  // Vérifier la visibilité lors du redimensionnement
  useEffect(() => {
    if (!isMobile && !isTablet) return;

    const handleResize = () => {
      setTimeout(ensureCanvasVisibility, 100); // Délai pour laisser le temps au redimensionnement
    };

    const handleOrientationChange = () => {
      setTimeout(ensureCanvasVisibility, 300); // Délai plus long pour l'orientation
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile, isTablet, ensureCanvasVisibility]);

  return {
    isDragging: isDraggingRef.current,
    ensureCanvasVisibility,
    handleDragStart,
    handleDragEnd
  };
};

import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseCanvasZoomProps {
  canvasRef: RefObject<HTMLDivElement>;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  initialZoom?: number;
}

interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export const useCanvasZoom = ({
  canvasRef,
  minZoom = 0.1,
  maxZoom = 5,
  zoomStep = 0.1,
  initialZoom = 1
}: UseCanvasZoomProps) => {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: initialZoom,
    translateX: 0,
    translateY: 0
  });

  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Fonction pour zoomer vers un point spécifique
  const zoomToPoint = useCallback((newScale: number, clientX: number, clientY: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculer la position relative dans le canvas
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculer la nouvelle translation pour garder le point sous le curseur
    const scaleDiff = newScale - zoomState.scale;
    const newTranslateX = zoomState.translateX - (x * scaleDiff);
    const newTranslateY = zoomState.translateY - (y * scaleDiff);

    setZoomState({
      scale: Math.max(minZoom, Math.min(maxZoom, newScale)),
      translateX: newTranslateX,
      translateY: newTranslateY
    });
  }, [zoomState, minZoom, maxZoom, canvasRef]);

  // Gestionnaire de zoom avec la molette
  const handleWheel = useCallback((e: WheelEvent) => {
    // Vérifier si Cmd (Mac) ou Ctrl (Windows/Linux) est pressé
    if (!(e.metaKey || e.ctrlKey)) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
    const newScale = zoomState.scale + delta;
    
    zoomToPoint(newScale, e.clientX, e.clientY);
  }, [zoomState.scale, zoomStep, zoomToPoint]);

  // Gestionnaire de zoom avec le trackpad (pinch)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Calculer le centre entre les deux doigts
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      // Utiliser une variable statique pour stocker la distance précédente
      const lastDistance = (handleTouchMove as any).lastDistance || distance;
      (handleTouchMove as any).lastDistance = distance;
      
      const scaleFactor = distance / lastDistance;
      const newScale = zoomState.scale * scaleFactor;
      
      zoomToPoint(newScale, centerX, centerY);
    }
  }, [zoomState.scale, zoomToPoint]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      (handleTouchMove as any).lastDistance = null;
    }
  }, [handleTouchMove]);

  // Gestionnaire de pan (déplacement)
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Bouton du milieu ou Alt + clic gauche
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      e.preventDefault();
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setZoomState(prev => ({
        ...prev,
        translateX: prev.translateX + deltaX,
        translateY: prev.translateY + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Fonctions utilitaires
  const resetZoom = useCallback(() => {
    setZoomState({
      scale: initialZoom,
      translateX: 0,
      translateY: 0
    });
  }, [initialZoom]);

  const zoomIn = useCallback(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoomToPoint(zoomState.scale + zoomStep, centerX, centerY);
  }, [zoomState.scale, zoomStep, zoomToPoint, canvasRef]);

  const zoomOut = useCallback(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoomToPoint(zoomState.scale - zoomStep, centerX, centerY);
  }, [zoomState.scale, zoomStep, zoomToPoint, canvasRef]);

  const fitToScreen = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    // Calculer le zoom pour que le contenu rentre dans l'écran
    const scaleX = containerWidth / 800; // Largeur de référence
    const scaleY = containerHeight / 600; // Hauteur de référence
    const newScale = Math.min(scaleX, scaleY, 1); // Ne pas zoomer au-delà de 100%
    
    setZoomState({
      scale: newScale,
      translateX: 0,
      translateY: 0
    });
  }, [canvasRef]);

  // Attacher les event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Event listeners pour le zoom
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Event listeners pour le pan
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    canvasRef
  ]);

  // Style CSS pour appliquer la transformation
  const canvasStyle = {
    transform: `scale(${zoomState.scale}) translate(${zoomState.translateX / zoomState.scale}px, ${zoomState.translateY / zoomState.scale}px)`,
    transformOrigin: '0 0',
    transition: isPanning ? 'none' : 'transform 0.1s ease-out'
  };

  return {
    zoomState,
    canvasStyle,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    isPanning
  };
};

import { useCallback, useRef, useState, useEffect } from 'react';

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  lastTimestamp: number;
}

interface UltraFluidDragDropOptions {
  containerRef: React.RefObject<HTMLElement> | React.RefObject<HTMLDivElement> | ((instance: HTMLDivElement | null) => void);
  onDragStart?: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove?: (elementId: string, position: { x: number; y: number }, velocity: { x: number; y: number }) => void;
  onDragEnd?: (elementId: string, position: { x: number; y: number }) => void;
  snapToGrid?: boolean;
  gridSize?: number;
  enableInertia?: boolean;
  dampingFactor?: number;
  enabled?: boolean;
}

export const useUltraFluidDragDrop = ({
  containerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  snapToGrid = false,
  gridSize = 10,
  enableInertia = true,
  dampingFactor = 0.95,
  enabled = true
}: UltraFluidDragDropOptions) => {
  
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    elementId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    lastTimestamp: 0
  });

  const rafRef = useRef<number>();
  const velocityHistoryRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Extract scale from CSS transform (supports matrix and matrix3d)
  const getScaleFromTransform = useCallback((transform: string | null | undefined) => {
    if (!transform || transform === 'none') return 1;
    // matrix(a, b, c, d, tx, ty) => scaleX = a
    const m2d = transform.match(/matrix\(([^)]+)\)/);
    if (m2d) {
      const values = m2d[1].split(',').map(v => parseFloat(v.trim()));
      return Number.isFinite(values[0]) ? values[0] : 1;
    }
    // matrix3d(m11, m12, ..., m44) => scaleX = m11
    const m3d = transform.match(/matrix3d\(([^)]+)\)/);
    if (m3d) {
      const values = m3d[1].split(',').map(v => parseFloat(v.trim()));
      return Number.isFinite(values[0]) ? values[0] : 1;
    }
    return 1;
  }, []);

  // Calculer la vélocité avec lissage
  const calculateVelocity = useCallback((
    currentPos: { x: number; y: number },
    timestamp: number
  ): { x: number; y: number } => {
    const history = velocityHistoryRef.current;
    history.push({ ...currentPos, timestamp });

    // Garder seulement les 5 dernières mesures (pour lissage)
    if (history.length > 5) {
      history.shift();
    }

    if (history.length < 2) {
      return { x: 0, y: 0 };
    }

    // Calculer la vélocité moyenne sur les dernières mesures
    const recent = history[history.length - 1];
    const older = history[Math.max(0, history.length - 3)];
    const deltaTime = recent.timestamp - older.timestamp;

    if (deltaTime === 0) return { x: 0, y: 0 };

    return {
      x: (recent.x - older.x) / deltaTime,
      y: (recent.y - older.y) / deltaTime
    };
  }, []);

  // Appliquer le snap à la grille si activé
  const applyGridSnap = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);

  // Boucle de rendu ultra-fluide avec requestAnimationFrame
  const renderLoop = useCallback(() => {
    const dragState = dragStateRef.current;

    if (!enabled) {
      return;
    }

    if (!dragState.isDragging || !dragState.elementId) {
      return;
    }

    const now = performance.now();
    const deltaTime = now - dragState.lastTimestamp;

    // Appliquer l'inertie si activée
    if (enableInertia && deltaTime > 0) {
      const smoothedVelocity = {
        x: dragState.velocity.x * dampingFactor,
        y: dragState.velocity.y * dampingFactor
      };

      // Prédiction de position pour réduire la latence perçue
      const predictedPosition = {
        x: dragState.currentPosition.x + smoothedVelocity.x * deltaTime * 0.1,
        y: dragState.currentPosition.y + smoothedVelocity.y * deltaTime * 0.1
      };

      dragState.currentPosition = predictedPosition;
      dragState.velocity = smoothedVelocity;
    }

    // Appliquer le snap à la grille
    const snappedPosition = applyGridSnap(
      dragState.currentPosition.x,
      dragState.currentPosition.y
    );

    // Callback de mouvement avec position lissée
    onDragMove?.(dragState.elementId, snappedPosition, dragState.velocity);

    dragState.lastTimestamp = now;

    // Continuer la boucle si on traîne encore
    if (dragState.isDragging) {
      rafRef.current = requestAnimationFrame(renderLoop);
    }
  }, [onDragMove, applyGridSnap, enableInertia, dampingFactor, enabled]);

  // Démarrer le drag
  const startDrag = useCallback((
    elementId: string,
    clientX: number,
    clientY: number,
    elementRect: { x: number; y: number; width: number; height: number }
  ) => {
    if (!enabled) return;
    if (!containerRef || typeof containerRef === 'function' || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerStyle = getComputedStyle(containerRef.current);

    // Calculer le zoom
    const zoomScale = getScaleFromTransform(containerStyle.transform);

    // Tenir compte du padding du conteneur avant de diviser par le zoom
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const paddingTop = parseFloat(containerStyle.paddingTop) || 0;

    // Position dans le canvas
    const canvasX = (clientX - containerRect.left - paddingLeft) / zoomScale;
    const canvasY = (clientY - containerRect.top - paddingTop) / zoomScale;

    // Offset par rapport au coin de l'élément
    const offset = {
      x: canvasX - elementRect.x,
      y: canvasY - elementRect.y
    };

    const startPosition = { x: canvasX, y: canvasY };

    // Initialiser l'état de drag
    dragStateRef.current = {
      isDragging: true,
      elementId,
      startPosition,
      currentPosition: startPosition,
      offset,
      velocity: { x: 0, y: 0 },
      lastTimestamp: performance.now()
    };

    // Réinitialiser l'historique de vélocité
    velocityHistoryRef.current = [];

    setIsDragging(true);
    onDragStart?.(elementId, startPosition);

    // Démarrer la boucle de rendu
    rafRef.current = requestAnimationFrame(renderLoop);

    // Styles pour une meilleure UX
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }, [containerRef, onDragStart, renderLoop, enabled]);

  // Mettre à jour la position pendant le drag
  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || !containerRef || typeof containerRef === 'function' || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerStyle = getComputedStyle(containerRef.current);
    
    // Calculer le zoom
    const zoomScale = getScaleFromTransform(containerStyle.transform);

    // Tenir compte du padding du conteneur avant de diviser par le zoom
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const paddingTop = parseFloat(containerStyle.paddingTop) || 0;

    // Nouvelle position dans le canvas
    const canvasX = (clientX - containerRect.left - paddingLeft) / zoomScale;
    const canvasY = (clientY - containerRect.top - paddingTop) / zoomScale;

    // Position de l'élément (en soustrayant l'offset)
    const elementPosition = {
      x: canvasX - dragState.offset.x,
      y: canvasY - dragState.offset.y
    };

    const now = performance.now();
    
    // Calculer la vélocité
    const velocity = calculateVelocity(elementPosition, now);

    // Mettre à jour l'état
    dragState.currentPosition = elementPosition;
    dragState.velocity = velocity;
    dragState.lastTimestamp = now;
  }, [containerRef, calculateVelocity, enabled]);

  // Terminer le drag
  const endDrag = useCallback(() => {
    if (!enabled) return;
    const dragState = dragStateRef.current;
    
    if (!dragState.isDragging || !dragState.elementId) return;

    // Arrêter la boucle de rendu
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const finalPosition = applyGridSnap(
      dragState.currentPosition.x,
      dragState.currentPosition.y
    );

    // Callback de fin
    onDragEnd?.(dragState.elementId, finalPosition);

    // Réinitialiser l'état
    dragStateRef.current = {
      isDragging: false,
      elementId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      lastTimestamp: 0
    };

    setIsDragging(false);

    // Restaurer les styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    // Nettoyer l'historique
    velocityHistoryRef.current = [];
  }, [onDragEnd, applyGridSnap, enabled]);

  // Gestionnaires d'événements globaux
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current.isDragging) {
        e.preventDefault();
        updateDrag(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      if (dragStateRef.current.isDragging) {
        endDrag();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (dragStateRef.current.isDragging && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        updateDrag(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      if (dragStateRef.current.isDragging) {
        endDrag();
      }
    };

    const handleTouchCancel = () => {
      if (dragStateRef.current.isDragging) {
        endDrag();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && dragStateRef.current.isDragging) {
        endDrag();
      }
    };

    // Si le hook est désactivé, ne rien attacher
    if (!enabled) {
      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }

    // Ajouter les listeners avec options optimisées
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true } as any);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
      document.removeEventListener('visibilitychange', handleVisibilityChange as any);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateDrag, endDrag, enabled]);

  return {
    // État
    isDragging,
    currentElementId: dragStateRef.current.elementId,
    
    // Méthodes
    startDrag,
    updateDrag,
    endDrag,
    
    // Utilitaires
    getCurrentPosition: () => dragStateRef.current.currentPosition,
    getCurrentVelocity: () => dragStateRef.current.velocity,
    
    // Configuration
    setSnapToGrid: (enabled: boolean) => { snapToGrid = enabled; },
    setGridSize: (size: number) => { gridSize = size; }
  };
};

import { useCallback, useMemo } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface SnapGuide {
  type: 'grid' | 'element' | 'center';
  orientation: 'horizontal' | 'vertical';
  position: number;
  elementId?: string;
}

interface UseSmartSnappingProps {
  containerRef: React.RefObject<HTMLElement> | React.RefObject<HTMLDivElement> | ((instance: HTMLDivElement | null) => void);
  gridSize?: number;
  snapTolerance?: number;
}

export const useSmartSnapping = ({
  containerRef,
  gridSize = 10,
  snapTolerance = 3
}: UseSmartSnappingProps) => {
  // We no longer rely on the `showGridLines` flag for snapping so the
  // magnetic grid is always active. The editor store is still queried for
  // campaign data to gather element dimensions.
  const { campaign } = useEditorStore();

  // Get all elements for snapping calculations
  const allElements = useMemo(() => {
    const elements: any[] = [];
    const customTexts = campaign?.design?.customTexts || {};
    const customImages = campaign?.design?.customImages || {};

    // Add text elements
    Object.entries(customTexts).forEach(([id, element]: [string, any]) => {
      elements.push({
        id,
        type: 'text',
        x: element.desktop?.x || element.x || 0,
        y: element.desktop?.y || element.y || 0,
        width: element.desktop?.width || element.width || 100,
        height: element.desktop?.height || element.height || 30
      });
    });

    // Add image elements
    Object.entries(customImages).forEach(([id, element]: [string, any]) => {
      elements.push({
        id,
        type: 'image',
        x: element.desktop?.x || element.x || 0,
        y: element.desktop?.y || element.y || 0,
        width: element.desktop?.width || element.width || 100,
        height: element.desktop?.height || element.height || 100
      });
    });

    return elements;
  }, [campaign?.design?.customTexts, campaign?.design?.customImages]);

  // Calculate snap guides
  // Helper: read current zoom from container's CSS transform
  const getContainerZoom = () => {
    if (!containerRef || typeof containerRef === 'function' || !containerRef.current) return 1;
    try {
      const style = getComputedStyle(containerRef.current);
      const transform = style.transform || (style as any).webkitTransform || 'none';
      if (!transform || transform === 'none') return 1;
      if (transform.startsWith('matrix3d(')) {
        const parts = transform.slice(9, -1).split(',').map((v: string) => parseFloat(v.trim()));
        const m11 = parts[0], m12 = parts[1], m13 = parts[2];
        const scaleX = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13) || 1;
        return scaleX;
      } else if (transform.startsWith('matrix(')) {
        const parts = transform.slice(7, -1).split(',').map((v: string) => parseFloat(v.trim()));
        const a = parts[0], b = parts[1];
        const scaleX = Math.sqrt(a * a + b * b) || 1;
        return scaleX;
      } else if (transform.startsWith('scale(')) {
        const s = parseFloat(transform.slice(6, -1));
        return !Number.isNaN(s) && s > 0 ? s : 1;
      }
    } catch {
      // ignore
    }
    return 1;
  };

  const calculateSnapGuides = useCallback((
    draggedElement: { x: number; y: number; width: number; height: number },
    excludeId?: string
  ): SnapGuide[] => {
    const guides: SnapGuide[] = [];
    
    if (!containerRef || typeof containerRef === 'function' || !containerRef.current) return guides;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const z = getContainerZoom();
    // Convertir la taille du conteneur en unités canvas
    const containerWidth = containerRect.width / z;
    const containerHeight = containerRect.height / z;
    // Tolérance exprimée en px viewport -> convertir en unités canvas
    const tol = (snapTolerance ?? 3) / z;

    // Grid snapping – always active for a magnetic grid experience.
    // Vertical grid lines
    for (let x = 0; x <= containerWidth; x += gridSize) {
      if (Math.abs(draggedElement.x - x) <= tol) {
        guides.push({
          type: 'grid',
          orientation: 'vertical',
          position: x
        });
      }
    }

    // Horizontal grid lines
    for (let y = 0; y <= containerHeight; y += gridSize) {
      if (Math.abs(draggedElement.y - y) <= tol) {
        guides.push({
          type: 'grid',
          orientation: 'horizontal',
          position: y
        });
      }
    }

    // Element snapping
    allElements.forEach(element => {
      if (element.id === excludeId) return;

      const elementLeft = element.x;
      const elementRight = element.x + element.width;
      const elementTop = element.y;
      const elementBottom = element.y + element.height;
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;

      const draggedLeft = draggedElement.x;
      const draggedRight = draggedElement.x + draggedElement.width;
      const draggedTop = draggedElement.y;
      const draggedBottom = draggedElement.y + draggedElement.height;
      const draggedCenterX = draggedElement.x + draggedElement.width / 2;
      const draggedCenterY = draggedElement.y + draggedElement.height / 2;

      // Vertical alignment guides
      [elementLeft, elementRight, elementCenterX].forEach(pos => {
        if (Math.abs(draggedLeft - pos) <= tol ||
            Math.abs(draggedRight - pos) <= tol ||
            Math.abs(draggedCenterX - pos) <= tol) {
          guides.push({
            type: 'element',
            orientation: 'vertical',
            position: pos,
            elementId: element.id
          });
        }
      });

      // Horizontal alignment guides
      [elementTop, elementBottom, elementCenterY].forEach(pos => {
        if (Math.abs(draggedTop - pos) <= tol ||
            Math.abs(draggedBottom - pos) <= tol ||
            Math.abs(draggedCenterY - pos) <= tol) {
          guides.push({
            type: 'element',
            orientation: 'horizontal',
            position: pos,
            elementId: element.id
          });
        }
      });
    });

    // Center alignment guides avec calculs précis
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Calculer le centre réel de l'élément en cours de déplacement
    const draggedCenterX = draggedElement.x + draggedElement.width / 2;
    const draggedCenterY = draggedElement.y + draggedElement.height / 2;
    
    // Tolérance adaptative basée sur la taille de l'élément (plus précise pour les petits éléments)
    const adaptiveToleranceX = Math.max(2 / z, Math.min(tol, draggedElement.width * 0.1));
    const adaptiveToleranceY = Math.max(2 / z, Math.min(tol, draggedElement.height * 0.1));
    
    // Guide vertical (alignement horizontal au centre)
    if (Math.abs(draggedCenterX - centerX) <= adaptiveToleranceX) {
      guides.push({
        type: 'center',
        orientation: 'vertical',
        position: centerX
      });
    }
    
    // Guide horizontal (alignement vertical au centre)
    if (Math.abs(draggedCenterY - centerY) <= adaptiveToleranceY) {
      guides.push({
        type: 'center',
        orientation: 'horizontal',
        position: centerY
      });
    }

    return guides;
  }, [allElements, gridSize, snapTolerance, containerRef]);

  // Apply snapping to position avec priorité au centre
  const applySnapping = useCallback((
    x: number,
    y: number,
    width: number = 100,
    height: number = 30,
    excludeId?: string
  ) => {
    const guides = calculateSnapGuides({ x, y, width, height }, excludeId);
    const z = getContainerZoom();
    const baseTol = (snapTolerance ?? 3) / z;
    
    let snappedX = x;
    let snappedY = y;
    let snapPriorityX = 0; // 0 = pas de snap, 1 = edge, 2 = center
    let snapPriorityY = 0;

    guides.forEach(guide => {
      if (guide.orientation === 'vertical') {
        // Calculer les différences avec plus de précision
        const leftDiff = Math.abs(x - guide.position);
        const rightDiff = Math.abs(x + width - guide.position);
        const centerDiff = Math.abs(x + width / 2 - guide.position);
        
        // Tolérance adaptative (identique en ressenti quel que soit le zoom)
        const tolerance = guide.type === 'center' ? Math.max(1 / z, width * 0.05) : baseTol;
        
        // Priorité au centre pour un alignement plus intuitif
        if (centerDiff <= tolerance && (snapPriorityX < 2 || guide.type === 'center')) {
          snappedX = guide.position - width / 2;
          snapPriorityX = guide.type === 'center' ? 2 : 1;
        } else if (leftDiff <= tolerance && snapPriorityX < 1) {
          snappedX = guide.position;
          snapPriorityX = 1;
        } else if (rightDiff <= tolerance && snapPriorityX < 1) {
          snappedX = guide.position - width;
          snapPriorityX = 1;
        }
      } else {
        // Même logique pour l'axe Y
        const topDiff = Math.abs(y - guide.position);
        const bottomDiff = Math.abs(y + height - guide.position);
        const centerDiff = Math.abs(y + height / 2 - guide.position);
        
        const tolerance = guide.type === 'center' ? Math.max(1 / z, height * 0.05) : baseTol;
        
        if (centerDiff <= tolerance && (snapPriorityY < 2 || guide.type === 'center')) {
          snappedY = guide.position - height / 2;
          snapPriorityY = guide.type === 'center' ? 2 : 1;
        } else if (topDiff <= tolerance && snapPriorityY < 1) {
          snappedY = guide.position;
          snapPriorityY = 1;
        } else if (bottomDiff <= tolerance && snapPriorityY < 1) {
          snappedY = guide.position - height;
          snapPriorityY = 1;
        }
      }
    });

    return {
      x: Math.round(snappedX * 2) / 2, // Arrondir à 0.5px pour plus de précision
      y: Math.round(snappedY * 2) / 2,
      guides,
      snappedToCenter: snapPriorityX === 2 || snapPriorityY === 2
    };
  }, [calculateSnapGuides, snapTolerance]);

  return {
    applySnapping,
    calculateSnapGuides,
    allElements
  };
};
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
  const calculateSnapGuides = useCallback((
    draggedElement: { x: number; y: number; width: number; height: number },
    excludeId?: string
  ): SnapGuide[] => {
    const guides: SnapGuide[] = [];
    
    if (!containerRef || typeof containerRef === 'function' || !containerRef.current) return guides;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Grid snapping – always active for a magnetic grid experience.
    // Vertical grid lines
    for (let x = 0; x <= containerWidth; x += gridSize) {
      if (Math.abs(draggedElement.x - x) <= snapTolerance) {
        guides.push({
          type: 'grid',
          orientation: 'vertical',
          position: x
        });
      }
    }

    // Horizontal grid lines
    for (let y = 0; y <= containerHeight; y += gridSize) {
      if (Math.abs(draggedElement.y - y) <= snapTolerance) {
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
        if (Math.abs(draggedLeft - pos) <= snapTolerance ||
            Math.abs(draggedRight - pos) <= snapTolerance ||
            Math.abs(draggedCenterX - pos) <= snapTolerance) {
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
        if (Math.abs(draggedTop - pos) <= snapTolerance ||
            Math.abs(draggedBottom - pos) <= snapTolerance ||
            Math.abs(draggedCenterY - pos) <= snapTolerance) {
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
    const adaptiveToleranceX = Math.max(2, Math.min(snapTolerance, draggedElement.width * 0.1));
    const adaptiveToleranceY = Math.max(2, Math.min(snapTolerance, draggedElement.height * 0.1));
    
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
        
        // Tolérance adaptative
        const tolerance = guide.type === 'center' ? Math.max(1, width * 0.05) : snapTolerance;
        
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
        
        const tolerance = guide.type === 'center' ? Math.max(1, height * 0.05) : snapTolerance;
        
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
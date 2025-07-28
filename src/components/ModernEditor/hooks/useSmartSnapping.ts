import { useCallback, useMemo } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface SnapGuide {
  type: 'grid' | 'element' | 'center';
  orientation: 'horizontal' | 'vertical';
  position: number;
  elementId?: string;
}

interface UseSmartSnappingProps {
  containerRef: React.RefObject<HTMLElement>;
  gridSize?: number;
  snapTolerance?: number;
}

export const useSmartSnapping = ({
  containerRef,
  gridSize = 10,
  snapTolerance = 5
}: UseSmartSnappingProps) => {
  const { campaign, showGridLines } = useEditorStore();

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
    
    if (!containerRef.current) return guides;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Grid snapping
    if (showGridLines) {
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

    // Center alignment guides
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    if (Math.abs(draggedElement.x + draggedElement.width / 2 - centerX) <= snapTolerance) {
      guides.push({
        type: 'center',
        orientation: 'vertical',
        position: centerX
      });
    }
    
    if (Math.abs(draggedElement.y + draggedElement.height / 2 - centerY) <= snapTolerance) {
      guides.push({
        type: 'center',
        orientation: 'horizontal',
        position: centerY
      });
    }

    return guides;
  }, [allElements, showGridLines, gridSize, snapTolerance, containerRef]);

  // Apply snapping to position
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

    guides.forEach(guide => {
      if (guide.orientation === 'vertical') {
        // Snap to left edge, right edge, or center
        const leftDiff = Math.abs(x - guide.position);
        const rightDiff = Math.abs(x + width - guide.position);
        const centerDiff = Math.abs(x + width / 2 - guide.position);
        
        if (leftDiff <= snapTolerance) {
          snappedX = guide.position;
        } else if (rightDiff <= snapTolerance) {
          snappedX = guide.position - width;
        } else if (centerDiff <= snapTolerance) {
          snappedX = guide.position - width / 2;
        }
      } else {
        // Snap to top edge, bottom edge, or center
        const topDiff = Math.abs(y - guide.position);
        const bottomDiff = Math.abs(y + height - guide.position);
        const centerDiff = Math.abs(y + height / 2 - guide.position);
        
        if (topDiff <= snapTolerance) {
          snappedY = guide.position;
        } else if (bottomDiff <= snapTolerance) {
          snappedY = guide.position - height;
        } else if (centerDiff <= snapTolerance) {
          snappedY = guide.position - height / 2;
        }
      }
    });

    return {
      x: snappedX,
      y: snappedY,
      guides
    };
  }, [calculateSnapGuides, snapTolerance]);

  return {
    applySnapping,
    calculateSnapGuides,
    allElements
  };
};
// @ts-nocheck
import { AlignmentSystem, type ElementBounds, type CanvasInfo, type AlignmentGuide } from '../core/AlignmentSystem';

interface UseAlignmentSystemProps {
  elements: ElementBounds[];
  canvasSize: { width: number; height: number };
  zoom: number;
  snapTolerance?: number;
  gridSize?: number;
  showGrid?: boolean;
}

export const useAlignmentSystem = ({
  elements,
  canvasSize,
  zoom,
  snapTolerance = 8,
  gridSize = 20,
  showGrid = false
}: UseAlignmentSystemProps) => {
  const [currentGuides, setCurrentGuides] = useState<AlignmentGuide[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Instance du système d'alignement
  const alignmentSystem = useMemo(() => {
    return new AlignmentSystem({
      snapTolerance,
      gridSize,
      showGrid
    });
  }, [snapTolerance, gridSize, showGrid]);

  // Canvas info
  const canvasInfo: CanvasInfo = useMemo(() => ({
    width: canvasSize.width,
    height: canvasSize.height,
    centerX: canvasSize.width / 2,
    centerY: canvasSize.height / 2
  }), [canvasSize]);

  // Fonction de snap avec guides
  const snapElement = useCallback((element: ElementBounds) => {
    const otherElements = elements.filter(el => el.id !== element.id);
    const result = alignmentSystem.calculateSnap(element, otherElements, canvasInfo, zoom);
    
    setCurrentGuides(result.guides);

    return result;
  }, [alignmentSystem, elements, canvasInfo, zoom]);

  // Alignement au canvas
  const alignToCanvas = useCallback((
    element: ElementBounds, 
    alignment: 'center-h' | 'center-v' | 'top' | 'bottom' | 'left' | 'right'
  ) => {
    return alignmentSystem.alignToCanvas(element, canvasInfo, alignment);
  }, [alignmentSystem, canvasInfo]);

  // Alignement à un autre élément
  const alignToElement = useCallback((
    element: ElementBounds,
    target: ElementBounds,
    alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v'
  ) => {
    return alignmentSystem.alignToElement(element, target, alignment);
  }, [alignmentSystem]);

  // Distribution d'éléments
  const distributeElements = useCallback((
    elementIds: string[],
    direction: 'horizontal' | 'vertical',
    spacing?: number
  ) => {
    const elementsToDistribute = elementIds
      .map(id => elements.find(el => el.id === id))
      .filter(Boolean) as ElementBounds[];

    return alignmentSystem.distributeElements(elementsToDistribute, direction, spacing);
  }, [alignmentSystem, elements]);

  // Gestion du dragging
  const startDragging = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    // Clear guides après un petit délai pour éviter le clignotement
    setTimeout(() => {
      setCurrentGuides([]);
    }, 400);
  }, []);

  // Utilitaires
  const clearGuides = useCallback(() => {
    setCurrentGuides([]);
  }, []);

  const updateConfig = useCallback((config: {
    snapTolerance?: number;
    gridSize?: number;
    showGrid?: boolean;
  }) => {
    if (config.snapTolerance !== undefined) {
      alignmentSystem.setSnapTolerance(config.snapTolerance);
    }
    if (config.gridSize !== undefined) {
      alignmentSystem.setGridSize(config.gridSize);
    }
    if (config.showGrid !== undefined) {
      alignmentSystem.setShowGrid(config.showGrid);
    }
  }, [alignmentSystem]);

  return {
    // État
    currentGuides,
    isDragging,
    
    // Actions
    snapElement,
    alignToCanvas,
    alignToElement,
    distributeElements,
    
    // Gestion du dragging
    startDragging,
    stopDragging,
    
    // Utilitaires
    clearGuides,
    updateConfig,
    
    // Instance du système (pour usage avancé)
    alignmentSystem
  };
};

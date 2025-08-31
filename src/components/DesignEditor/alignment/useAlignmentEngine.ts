import { useState, useCallback, useMemo } from 'react';
import { AlignmentEngine, type Element, type Canvas, type AlignmentGuide } from './AlignmentEngine';

interface UseAlignmentEngineOptions {
  elements: any[];
  canvasSize: { width: number; height: number };
  zoom: number;
  snapTolerance?: number;
  gridSize?: number;
  showGrid?: boolean;
}

export const useAlignmentEngine = ({
  elements,
  canvasSize,
  zoom,
  snapTolerance = 10,
  gridSize = 20,
  showGrid = false
}: UseAlignmentEngineOptions) => {
  const [currentGuides, setCurrentGuides] = useState<AlignmentGuide[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Créer l'instance du moteur d'alignement
  const engine = useMemo(() => {
    return new AlignmentEngine({
      snapTolerance,
      gridSize,
      showGrid
    });
  }, [snapTolerance, gridSize, showGrid]);

  // Convertir les éléments au format attendu
  const convertedElements = useMemo(() => {
    return elements.map(el => ({
      id: el.id,
      x: el.x || 0,
      y: el.y || 0,
      width: el.width || 100,
      height: el.height || 30
    }));
  }, [elements]);

  const canvas: Canvas = useMemo(() => ({
    width: canvasSize.width,
    height: canvasSize.height
  }), [canvasSize]);

  // Fonction de snap
  const applySnap = useCallback((element: Element, excludeIds: string[] = []) => {
    const otherElements = convertedElements.filter(el => 
      el.id !== element.id && !excludeIds.includes(el.id)
    );
    
    const result = engine.calculateSnap(element, otherElements, canvas, zoom);
    return result;
  }, [engine, convertedElements, canvas, zoom]);

  // Alignement au canvas
  const alignToCanvas = useCallback((
    elementId: string, 
    type: 'center-horizontal' | 'center-vertical' | 'top' | 'bottom' | 'left' | 'right'
  ) => {
    const element = convertedElements.find(el => el.id === elementId);
    if (!element) return null;

    return engine.alignToCanvas(element, canvas, type);
  }, [engine, convertedElements, canvas]);

  // Alignement à un autre élément
  const alignToElement = useCallback((
    elementId: string,
    targetElementId: string,
    type: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical'
  ) => {
    const element = convertedElements.find(el => el.id === elementId);
    const targetElement = convertedElements.find(el => el.id === targetElementId);
    
    if (!element || !targetElement) return null;

    return engine.alignToElement(element, targetElement, type);
  }, [engine, convertedElements]);

  // Distribution d'éléments
  const distributeElements = useCallback((
    elementIds: string[],
    direction: 'horizontal' | 'vertical',
    spacing?: number
  ) => {
    const elementsToDistribute = convertedElements.filter(el => 
      elementIds.includes(el.id)
    );
    
    if (elementsToDistribute.length < 2) return [];

    return engine.distributeElements(elementsToDistribute, direction, spacing);
  }, [engine, convertedElements]);

  // Gestion des guides
  const updateGuides = useCallback((guides: AlignmentGuide[]) => {
    setCurrentGuides(guides);
  }, []);

  const clearGuides = useCallback(() => {
    setCurrentGuides([]);
    setIsDragging(false);
  }, []);

  const startDragging = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    // Nettoyer les guides après un délai
    setTimeout(() => {
      setCurrentGuides([]);
    }, 200);
  }, []);

  return {
    // État
    currentGuides,
    isDragging,
    
    // Actions
    applySnap,
    alignToCanvas,
    alignToElement,
    distributeElements,
    
    // Gestion des guides
    updateGuides,
    clearGuides,
    startDragging,
    stopDragging,
    
    // Configuration
    setSnapTolerance: engine.setSnapTolerance.bind(engine),
    setGridSize: engine.setGridSize.bind(engine),
    setShowGrid: engine.setShowGrid.bind(engine)
  };
};

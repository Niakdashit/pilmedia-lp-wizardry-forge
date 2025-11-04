/**
 * Système d'alignement simple et efficace pour Design Editor
 * Basé sur les spécifications utilisateur
 */

export interface ElementBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasInfo {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface AlignmentGuide {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number;
  color: string;
  opacity: number;
  source: 'canvas-center' | 'canvas-edge' | 'element' | 'grid';
}

export interface SnapResult {
  x: number;
  y: number;
  snapped: boolean;
  guides: AlignmentGuide[];
}

interface SnapCandidate {
  position: number;
  distance: number;
  priority: number;
  guide: AlignmentGuide;
}

export class AlignmentSystem {
  private snapTolerance: number = 8;
  private gridSize: number = 20;
  private showGrid: boolean = false;
  private lastSnapState: { [elementId: string]: { x?: number; y?: number } } = {};
  private enabled: boolean = false;

  constructor(options?: {
    snapTolerance?: number;
    gridSize?: number;
    showGrid?: boolean;
    enabled?: boolean;
  }) {
    if (options?.snapTolerance) this.snapTolerance = options.snapTolerance;
    if (options?.gridSize) this.gridSize = options.gridSize;
    if (options?.showGrid !== undefined) this.showGrid = options.showGrid;
    if (options?.enabled !== undefined) this.enabled = options.enabled;
  }

  /**
   * 1. Alignements de base par rapport au canevas
   */
  alignToCanvas(element: ElementBounds, canvas: CanvasInfo, alignment: 'center-h' | 'center-v' | 'top' | 'bottom' | 'left' | 'right'): { x: number; y: number } {
    let x = element.x;
    let y = element.y;

    switch (alignment) {
      case 'center-h':
        x = canvas.centerX - element.width / 2;
        break;
      case 'center-v':
        y = canvas.centerY - element.height / 2;
        break;
      case 'top':
        y = 0;
        break;
      case 'bottom':
        y = canvas.height - element.height;
        break;
      case 'left':
        x = 0;
        break;
      case 'right':
        x = canvas.width - element.width;
        break;
    }

    return { x, y };
  }

  /**
   * 2. Alignements relatifs aux autres éléments
   */
  alignToElement(
    element: ElementBounds, 
    target: ElementBounds, 
    alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v'
  ): { x: number; y: number } {
    let x = element.x;
    let y = element.y;

    switch (alignment) {
      case 'left':
        x = target.x;
        break;
      case 'right':
        x = target.x + target.width - element.width;
        break;
      case 'top':
        y = target.y;
        break;
      case 'bottom':
        y = target.y + target.height - element.height;
        break;
      case 'center-h':
        x = target.x + target.width / 2 - element.width / 2;
        break;
      case 'center-v':
        y = target.y + target.height / 2 - element.height / 2;
        break;
    }

    return { x, y };
  }

  /**
   * 3. Système de snap avec guides visuels - Version refactorisée
   * Logique: 1 guide max par axe, priorités claires, tolérance adaptative
   */
  calculateSnap(
    element: ElementBounds,
    otherElements: ElementBounds[],
    canvas: CanvasInfo,
    zoom: number = 1
  ): SnapResult {
    const globalDisabled = (typeof window !== 'undefined') && (window as any).__DISABLE_ALIGNMENT_SNAP__ === true;
    if (!this.enabled || globalDisabled) {
      return { x: element.x, y: element.y, snapped: false, guides: [] };
    }
    // Tolérance adaptative: min 3px, max 12px
    const baseTolerance = Math.max(3, Math.min(12, this.snapTolerance / zoom));
    
    // Hystérésis: si déjà snappé, tolérance +2px pour éviter clignotements
    const lastSnap = this.lastSnapState[element.id];
    const hysteresisTolerance = baseTolerance + 2;

    const verticalCandidates: SnapCandidate[] = [];
    const horizontalCandidates: SnapCandidate[] = [];

    // === CANDIDATS VERTICAUX (X) ===
    
    // 1. Centre canvas (priorité 1 - la plus haute)
    const centerXDistance = Math.abs(element.x + element.width / 2 - canvas.centerX);
    const centerXTolerance = lastSnap?.x === canvas.centerX - element.width / 2 ? hysteresisTolerance : baseTolerance;
    if (centerXDistance <= centerXTolerance) {
      verticalCandidates.push({
        position: canvas.centerX - element.width / 2,
        distance: centerXDistance,
        priority: 1,
        guide: {
          id: 'canvas-center-v',
          type: 'vertical',
          position: canvas.centerX,
          color: '#8d117a',
          opacity: 1,
          source: 'canvas-center'
        }
      });
    }

    // 2. Centres d'éléments (priorité 2)
    otherElements.forEach((other, index) => {
      if (other.id === element.id) return;
      
      const otherCenterX = other.x + other.width / 2;
      const elementCenterX = element.x + element.width / 2;
      const distance = Math.abs(elementCenterX - otherCenterX);
      const tolerance = lastSnap?.x === otherCenterX - element.width / 2 ? hysteresisTolerance : baseTolerance;
      
      if (distance <= tolerance) {
        verticalCandidates.push({
          position: otherCenterX - element.width / 2,
          distance,
          priority: 2,
          guide: {
            id: `element-${index}-center-v`,
            type: 'vertical',
            position: otherCenterX,
            color: '#10b981',
            opacity: 0.9,
            source: 'element'
          }
        });
      }

      // Bords d'éléments (priorité 3)
      const leftDistance = Math.abs(element.x - other.x);
      const rightDistance = Math.abs(element.x + element.width - (other.x + other.width));
      const leftTolerance = lastSnap?.x === other.x ? hysteresisTolerance : baseTolerance;
      const rightTolerance = lastSnap?.x === other.x + other.width - element.width ? hysteresisTolerance : baseTolerance;

      if (leftDistance <= leftTolerance) {
        verticalCandidates.push({
          position: other.x,
          distance: leftDistance,
          priority: 3,
          guide: {
            id: `element-${index}-left`,
            type: 'vertical',
            position: other.x,
            color: '#10b981',
            opacity: 0.8,
            source: 'element'
          }
        });
      }

      if (rightDistance <= rightTolerance) {
        verticalCandidates.push({
          position: other.x + other.width - element.width,
          distance: rightDistance,
          priority: 3,
          guide: {
            id: `element-${index}-right`,
            type: 'vertical',
            position: other.x + other.width,
            color: '#10b981',
            opacity: 0.8,
            source: 'element'
          }
        });
      }
    });

    // 4. Bords canvas avec safe area (priorité 4)
    const safeMargin = 16;
    const canvasEdges = [
      { pos: safeMargin, id: 'canvas-edge-left', position: safeMargin },
      { pos: canvas.width - safeMargin, id: 'canvas-edge-right', position: canvas.width - safeMargin - element.width }
    ];

    canvasEdges.forEach(edge => {
      const distance = Math.abs(element.x - edge.position);
      const tolerance = lastSnap?.x === edge.position ? hysteresisTolerance : baseTolerance;
      
      if (distance <= tolerance) {
        verticalCandidates.push({
          position: edge.position,
          distance,
          priority: 4,
          guide: {
            id: edge.id,
            type: 'vertical',
            position: edge.pos,
            color: '#6366f1',
            opacity: 0.7,
            source: 'canvas-edge'
          }
        });
      }
    });

    // 5. Grille (priorité 5 - la plus faible)
    if (this.showGrid) {
      const gridX = Math.round(element.x / this.gridSize) * this.gridSize;
      const distance = Math.abs(element.x - gridX);
      const tolerance = lastSnap?.x === gridX ? hysteresisTolerance : baseTolerance;
      
      if (distance <= tolerance) {
        verticalCandidates.push({
          position: gridX,
          distance,
          priority: 5,
          guide: {
            id: `grid-x-${gridX}`,
            type: 'vertical',
            position: gridX,
            color: '#94a3b8',
            opacity: 0.5,
            source: 'grid'
          }
        });
      }
    }

    // === CANDIDATS HORIZONTAUX (Y) ===
    
    // 1. Centre canvas (priorité 1)
    const centerYDistance = Math.abs(element.y + element.height / 2 - canvas.centerY);
    const centerYTolerance = lastSnap?.y === canvas.centerY - element.height / 2 ? hysteresisTolerance : baseTolerance;
    if (centerYDistance <= centerYTolerance) {
      horizontalCandidates.push({
        position: canvas.centerY - element.height / 2,
        distance: centerYDistance,
        priority: 1,
        guide: {
          id: 'canvas-center-h',
          type: 'horizontal',
          position: canvas.centerY,
          color: '#8d117a',
          opacity: 1,
          source: 'canvas-center'
        }
      });
    }

    // 2. Centres d'éléments (priorité 2)
    otherElements.forEach((other, index) => {
      if (other.id === element.id) return;
      
      const otherCenterY = other.y + other.height / 2;
      const elementCenterY = element.y + element.height / 2;
      const distance = Math.abs(elementCenterY - otherCenterY);
      const tolerance = lastSnap?.y === otherCenterY - element.height / 2 ? hysteresisTolerance : baseTolerance;
      
      if (distance <= tolerance) {
        horizontalCandidates.push({
          position: otherCenterY - element.height / 2,
          distance,
          priority: 2,
          guide: {
            id: `element-${index}-center-h`,
            type: 'horizontal',
            position: otherCenterY,
            color: '#10b981',
            opacity: 0.9,
            source: 'element'
          }
        });
      }

      // Bords d'éléments (priorité 3)
      const topDistance = Math.abs(element.y - other.y);
      const bottomDistance = Math.abs(element.y + element.height - (other.y + other.height));
      const topTolerance = lastSnap?.y === other.y ? hysteresisTolerance : baseTolerance;
      const bottomTolerance = lastSnap?.y === other.y + other.height - element.height ? hysteresisTolerance : baseTolerance;

      if (topDistance <= topTolerance) {
        horizontalCandidates.push({
          position: other.y,
          distance: topDistance,
          priority: 3,
          guide: {
            id: `element-${index}-top`,
            type: 'horizontal',
            position: other.y,
            color: '#10b981',
            opacity: 0.8,
            source: 'element'
          }
        });
      }

      if (bottomDistance <= bottomTolerance) {
        horizontalCandidates.push({
          position: other.y + other.height - element.height,
          distance: bottomDistance,
          priority: 3,
          guide: {
            id: `element-${index}-bottom`,
            type: 'horizontal',
            position: other.y + other.height,
            color: '#10b981',
            opacity: 0.8,
            source: 'element'
          }
        });
      }
    });

    // 4. Bords canvas avec safe area (priorité 4)
    const canvasHorizontalEdges = [
      { pos: safeMargin, id: 'canvas-edge-top', position: safeMargin },
      { pos: canvas.height - safeMargin, id: 'canvas-edge-bottom', position: canvas.height - safeMargin - element.height }
    ];

    canvasHorizontalEdges.forEach(edge => {
      const distance = Math.abs(element.y - edge.position);
      const tolerance = lastSnap?.y === edge.position ? hysteresisTolerance : baseTolerance;
      
      if (distance <= tolerance) {
        horizontalCandidates.push({
          position: edge.position,
          distance,
          priority: 4,
          guide: {
            id: edge.id,
            type: 'horizontal',
            position: edge.pos,
            color: '#6366f1',
            opacity: 0.7,
            source: 'canvas-edge'
          }
        });
      }
    });

    // 5. Grille (priorité 5)
    if (this.showGrid) {
      const gridY = Math.round(element.y / this.gridSize) * this.gridSize;
      const distance = Math.abs(element.y - gridY);
      const tolerance = lastSnap?.y === gridY ? hysteresisTolerance : baseTolerance;
      
      if (distance <= tolerance) {
        horizontalCandidates.push({
          position: gridY,
          distance,
          priority: 5,
          guide: {
            id: `grid-y-${gridY}`,
            type: 'horizontal',
            position: gridY,
            color: '#94a3b8',
            opacity: 0.5,
            source: 'grid'
          }
        });
      }
    }

    // === SÉLECTION DU MEILLEUR CANDIDAT PAR AXE ===
    
    let snappedX = element.x;
    let snappedY = element.y;
    const finalGuides: AlignmentGuide[] = [];

    // Meilleur candidat vertical (priorité puis distance)
    if (verticalCandidates.length > 0) {
      const bestVertical = verticalCandidates.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.distance - b.distance;
      })[0];
      
      snappedX = bestVertical.position;
      finalGuides.push(bestVertical.guide);
    }

    // Meilleur candidat horizontal (priorité puis distance)
    if (horizontalCandidates.length > 0) {
      const bestHorizontal = horizontalCandidates.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.distance - b.distance;
      })[0];
      
      snappedY = bestHorizontal.position;
      finalGuides.push(bestHorizontal.guide);
    }

    // Mémoriser l'état pour hystérésis
    this.lastSnapState[element.id] = {
      x: snappedX !== element.x ? snappedX : undefined,
      y: snappedY !== element.y ? snappedY : undefined
    };

    return {
      x: snappedX,
      y: snappedY,
      snapped: snappedX !== element.x || snappedY !== element.y,
      guides: finalGuides
    };
  }

  /**
   * 4. Distribution automatique d'éléments
   */
  distributeElements(
    elements: ElementBounds[],
    direction: 'horizontal' | 'vertical',
    spacing?: number
  ): Array<{ id: string; x: number; y: number }> {
    if (elements.length < 2) return [];

    const sorted = [...elements].sort((a, b) => 
      direction === 'horizontal' ? a.x - b.x : a.y - b.y
    );

    const result: Array<{ id: string; x: number; y: number }> = [];

    if (spacing !== undefined) {
      // Espacement uniforme
      let currentPos = direction === 'horizontal' ? sorted[0].x : sorted[0].y;
      
      sorted.forEach(element => {
        result.push({
          id: element.id,
          x: direction === 'horizontal' ? currentPos : element.x,
          y: direction === 'vertical' ? currentPos : element.y
        });
        currentPos += (direction === 'horizontal' ? element.width : element.height) + spacing;
      });
    } else {
      // Distribution égale dans l'espace disponible
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpace = direction === 'horizontal' 
        ? (last.x + last.width) - first.x
        : (last.y + last.height) - first.y;
      
      const spacing = totalSpace / (sorted.length - 1);
      
      sorted.forEach((element, index) => {
        const pos = (direction === 'horizontal' ? first.x : first.y) + (spacing * index);
        result.push({
          id: element.id,
          x: direction === 'horizontal' ? pos : element.x,
          y: direction === 'vertical' ? pos : element.y
        });
      });
    }

    return result;
  }

  /**
   * Configuration
   */
  setSnapTolerance(tolerance: number): void {
    this.snapTolerance = tolerance;
  }

  setGridSize(size: number): void {
    this.gridSize = size;
  }

  setShowGrid(show: boolean): void {
    this.showGrid = show;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
  }
}

export default AlignmentSystem;

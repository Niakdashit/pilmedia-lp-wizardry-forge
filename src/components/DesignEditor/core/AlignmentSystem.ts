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

export class AlignmentSystem {
  private snapTolerance: number = 8;
  private gridSize: number = 20;
  private showGrid: boolean = false;

  constructor(options?: {
    snapTolerance?: number;
    gridSize?: number;
    showGrid?: boolean;
  }) {
    if (options?.snapTolerance) this.snapTolerance = options.snapTolerance;
    if (options?.gridSize) this.gridSize = options.gridSize;
    if (options?.showGrid !== undefined) this.showGrid = options.showGrid;
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
   * 3. Système de snap avec guides visuels
   */
  calculateSnap(
    element: ElementBounds,
    otherElements: ElementBounds[],
    canvas: CanvasInfo,
    zoom: number = 1
  ): SnapResult {
    const tolerance = this.snapTolerance / zoom;
    const guides: AlignmentGuide[] = [];
    let snappedX = element.x;
    let snappedY = element.y;
    let hasSnapped = false;

    // Snap au centre du canvas (priorité haute)
    if (Math.abs(element.x + element.width / 2 - canvas.centerX) <= tolerance) {
      snappedX = canvas.centerX - element.width / 2;
      hasSnapped = true;
      guides.push({
        id: 'canvas-center-v',
        type: 'vertical',
        position: canvas.centerX,
        color: '#8d117a',
        opacity: 1,
        source: 'canvas-center'
      });
    }

    if (Math.abs(element.y + element.height / 2 - canvas.centerY) <= tolerance) {
      snappedY = canvas.centerY - element.height / 2;
      hasSnapped = true;
      guides.push({
        id: 'canvas-center-h',
        type: 'horizontal',
        position: canvas.centerY,
        color: '#8d117a',
        opacity: 1,
        source: 'canvas-center'
      });
    }

    // Snap aux bords du canvas
    const canvasEdges = [
      { pos: 0, type: 'left' },
      { pos: canvas.width, type: 'right' },
      { pos: 0, type: 'top' },
      { pos: canvas.height, type: 'bottom' }
    ];

    canvasEdges.forEach(edge => {
      if (edge.type === 'left' && Math.abs(element.x - edge.pos) <= tolerance) {
        snappedX = edge.pos;
        hasSnapped = true;
        guides.push({
          id: 'canvas-edge-left',
          type: 'vertical',
          position: edge.pos,
          color: '#6366f1',
          opacity: 0.8,
          source: 'canvas-edge'
        });
      }
      if (edge.type === 'right' && Math.abs(element.x + element.width - edge.pos) <= tolerance) {
        snappedX = edge.pos - element.width;
        hasSnapped = true;
        guides.push({
          id: 'canvas-edge-right',
          type: 'vertical',
          position: edge.pos,
          color: '#6366f1',
          opacity: 0.8,
          source: 'canvas-edge'
        });
      }
      if (edge.type === 'top' && Math.abs(element.y - edge.pos) <= tolerance) {
        snappedY = edge.pos;
        hasSnapped = true;
        guides.push({
          id: 'canvas-edge-top',
          type: 'horizontal',
          position: edge.pos,
          color: '#6366f1',
          opacity: 0.8,
          source: 'canvas-edge'
        });
      }
      if (edge.type === 'bottom' && Math.abs(element.y + element.height - edge.pos) <= tolerance) {
        snappedY = edge.pos - element.height;
        hasSnapped = true;
        guides.push({
          id: 'canvas-edge-bottom',
          type: 'horizontal',
          position: edge.pos,
          color: '#6366f1',
          opacity: 0.8,
          source: 'canvas-edge'
        });
      }
    });

    // Snap aux autres éléments
    otherElements.forEach((other, index) => {
      if (other.id === element.id) return;

      // Alignement horizontal (même Y ou centre Y)
      if (Math.abs(element.y - other.y) <= tolerance) {
        snappedY = other.y;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-top`,
          type: 'horizontal',
          position: other.y,
          color: '#10b981',
          opacity: 0.9,
          source: 'element'
        });
      }

      if (Math.abs(element.y + element.height / 2 - (other.y + other.height / 2)) <= tolerance) {
        snappedY = other.y + other.height / 2 - element.height / 2;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-center-h`,
          type: 'horizontal',
          position: other.y + other.height / 2,
          color: '#10b981',
          opacity: 0.9,
          source: 'element'
        });
      }

      // Alignement vertical (même X ou centre X)
      if (Math.abs(element.x - other.x) <= tolerance) {
        snappedX = other.x;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-left`,
          type: 'vertical',
          position: other.x,
          color: '#10b981',
          opacity: 0.9,
          source: 'element'
        });
      }

      if (Math.abs(element.x + element.width / 2 - (other.x + other.width / 2)) <= tolerance) {
        snappedX = other.x + other.width / 2 - element.width / 2;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-center-v`,
          type: 'vertical',
          position: other.x + other.width / 2,
          color: '#10b981',
          opacity: 0.9,
          source: 'element'
        });
      }
    });

    // Snap à la grille si activée
    if (this.showGrid) {
      const gridX = Math.round(element.x / this.gridSize) * this.gridSize;
      const gridY = Math.round(element.y / this.gridSize) * this.gridSize;

      if (Math.abs(element.x - gridX) <= tolerance) {
        snappedX = gridX;
        hasSnapped = true;
        guides.push({
          id: `grid-x-${gridX}`,
          type: 'vertical',
          position: gridX,
          color: '#94a3b8',
          opacity: 0.6,
          source: 'grid'
        });
      }

      if (Math.abs(element.y - gridY) <= tolerance) {
        snappedY = gridY;
        hasSnapped = true;
        guides.push({
          id: `grid-y-${gridY}`,
          type: 'horizontal',
          position: gridY,
          color: '#94a3b8',
          opacity: 0.6,
          source: 'grid'
        });
      }
    }

    return {
      x: snappedX,
      y: snappedY,
      snapped: hasSnapped,
      guides
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
}

export default AlignmentSystem;

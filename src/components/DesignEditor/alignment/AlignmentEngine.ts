/**
 * Nouveau système d'alignement - Créé depuis zéro
 * Système complet pour alignements canvas et relatifs aux autres éléments
 */

export interface Element {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Canvas {
  width: number;
  height: number;
}

export interface AlignmentGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  opacity: number;
  label?: string;
}

export interface SnapResult {
  x: number;
  y: number;
  snapped: boolean;
  guides: AlignmentGuide[];
}

export class AlignmentEngine {
  private snapTolerance: number = 10;
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
   * 1. Alignements de base par rapport au canvas
   */
  alignToCanvas(element: Element, canvas: Canvas, type: 'center-horizontal' | 'center-vertical' | 'top' | 'bottom' | 'left' | 'right'): { x: number; y: number } {
    const result = { x: element.x, y: element.y };

    switch (type) {
      case 'center-horizontal':
        result.x = (canvas.width - element.width) / 2;
        break;
      case 'center-vertical':
        result.y = (canvas.height - element.height) / 2;
        break;
      case 'top':
        result.y = 0;
        break;
      case 'bottom':
        result.y = canvas.height - element.height;
        break;
      case 'left':
        result.x = 0;
        break;
      case 'right':
        result.x = canvas.width - element.width;
        break;
    }

    return result;
  }

  /**
   * 2. Alignements relatifs aux autres éléments
   * INCLUANT les alignements centre horizontal/vertical
   */
  alignToElement(
    element: Element, 
    targetElement: Element, 
    type: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical'
  ): { x: number; y: number } {
    const result = { x: element.x, y: element.y };

    switch (type) {
      case 'left':
        result.x = targetElement.x;
        break;
      case 'right':
        result.x = targetElement.x + targetElement.width - element.width;
        break;
      case 'top':
        result.y = targetElement.y;
        break;
      case 'bottom':
        result.y = targetElement.y + targetElement.height - element.height;
        break;
      case 'center-horizontal':
        // Aligner le centre horizontal de l'élément avec le centre horizontal de la cible
        result.x = targetElement.x + (targetElement.width - element.width) / 2;
        break;
      case 'center-vertical':
        // Aligner le centre vertical de l'élément avec le centre vertical de la cible
        result.y = targetElement.y + (targetElement.height - element.height) / 2;
        break;
    }

    return result;
  }

  /**
   * 3. Système de snap intelligent avec guides visuels
   */
  calculateSnap(
    element: Element,
    allElements: Element[],
    canvas: Canvas,
    zoom: number = 1
  ): SnapResult {
    const tolerance = this.snapTolerance / zoom;
    const guides: AlignmentGuide[] = [];
    let snappedX = element.x;
    let snappedY = element.y;
    let hasSnapped = false;

    console.log('🔍 calculateSnap called:', { 
      element, 
      allElements: allElements.length, 
      canvas, 
      tolerance 
    });

    // Centres de l'élément en cours
    const elementCenterX = element.x + element.width / 2;
    const elementCenterY = element.y + element.height / 2;

    // Centre du canvas
    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    console.log('📐 Centers:', { 
      elementCenter: [elementCenterX, elementCenterY], 
      canvasCenter: [canvasCenterX, canvasCenterY] 
    });

    // 1. Snap au centre du canvas (priorité maximale)
    if (Math.abs(elementCenterX - canvasCenterX) <= tolerance) {
      snappedX = canvasCenterX - element.width / 2;
      hasSnapped = true;
      guides.push({
        id: 'canvas-center-v',
        type: 'vertical',
        position: canvasCenterX,
        color: '#ff6b35', // Orange vif - nouvelle couleur
        opacity: 1,
        label: 'Centre Canvas'
      });
    }

    if (Math.abs(elementCenterY - canvasCenterY) <= tolerance) {
      snappedY = canvasCenterY - element.height / 2;
      hasSnapped = true;
      guides.push({
        id: 'canvas-center-h',
        type: 'horizontal',
        position: canvasCenterY,
        color: '#ff6b35', // Orange vif - nouvelle couleur
        opacity: 1,
        label: 'Centre Canvas'
      });
    }

    // 2. Snap aux bords du canvas
    // Bord gauche
    if (Math.abs(element.x - 0) <= tolerance) {
      snappedX = 0;
      hasSnapped = true;
      guides.push({
        id: 'canvas-left',
        type: 'vertical',
        position: 0,
        color: '#4ecdc4', // Turquoise - nouvelle couleur
        opacity: 0.8,
        label: 'Bord Gauche'
      });
    }

    // Bord droit
    if (Math.abs(element.x + element.width - canvas.width) <= tolerance) {
      snappedX = canvas.width - element.width;
      hasSnapped = true;
      guides.push({
        id: 'canvas-right',
        type: 'vertical',
        position: canvas.width,
        color: '#4ecdc4', // Turquoise - nouvelle couleur
        opacity: 0.8,
        label: 'Bord Droit'
      });
    }

    // Bord haut
    if (Math.abs(element.y - 0) <= tolerance) {
      snappedY = 0;
      hasSnapped = true;
      guides.push({
        id: 'canvas-top',
        type: 'horizontal',
        position: 0,
        color: '#4ecdc4', // Turquoise - nouvelle couleur
        opacity: 0.8,
        label: 'Bord Haut'
      });
    }

    // Bord bas
    if (Math.abs(element.y + element.height - canvas.height) <= tolerance) {
      snappedY = canvas.height - element.height;
      hasSnapped = true;
      guides.push({
        id: 'canvas-bottom',
        type: 'horizontal',
        position: canvas.height,
        color: '#4ecdc4', // Turquoise - nouvelle couleur
        opacity: 0.8,
        label: 'Bord Bas'
      });
    }

    // 3. Snap aux autres éléments (INCLUANT les centres)
    allElements.forEach((otherElement, index) => {
      if (otherElement.id === element.id) return;

      const otherCenterX = otherElement.x + otherElement.width / 2;
      const otherCenterY = otherElement.y + otherElement.height / 2;

      // Alignement bord gauche
      if (Math.abs(element.x - otherElement.x) <= tolerance) {
        snappedX = otherElement.x;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-left`,
          type: 'vertical',
          position: otherElement.x,
          color: '#f7b731', // Jaune doré - nouvelle couleur
          opacity: 0.9,
          label: 'Bord Gauche'
        });
      }

      // Alignement bord droit
      if (Math.abs(element.x + element.width - (otherElement.x + otherElement.width)) <= tolerance) {
        snappedX = otherElement.x + otherElement.width - element.width;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-right`,
          type: 'vertical',
          position: otherElement.x + otherElement.width,
          color: '#f7b731', // Jaune doré - nouvelle couleur
          opacity: 0.9,
          label: 'Bord Droit'
        });
      }

      // Alignement bord haut
      if (Math.abs(element.y - otherElement.y) <= tolerance) {
        snappedY = otherElement.y;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-top`,
          type: 'horizontal',
          position: otherElement.y,
          color: '#f7b731', // Jaune doré - nouvelle couleur
          opacity: 0.9,
          label: 'Bord Haut'
        });
      }

      // Alignement bord bas
      if (Math.abs(element.y + element.height - (otherElement.y + otherElement.height)) <= tolerance) {
        snappedY = otherElement.y + otherElement.height - element.height;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-bottom`,
          type: 'horizontal',
          position: otherElement.y + otherElement.height,
          color: '#f7b731', // Jaune doré - nouvelle couleur
          opacity: 0.9,
          label: 'Bord Bas'
        });
      }

      // *** NOUVEAU : Alignement centre horizontal ***
      if (Math.abs(elementCenterX - otherCenterX) <= tolerance) {
        snappedX = otherCenterX - element.width / 2;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-center-h`,
          type: 'vertical',
          position: otherCenterX,
          color: '#e056fd', // Violet magenta - nouvelle couleur
          opacity: 1,
          label: 'Centre Horizontal'
        });
      }

      // *** NOUVEAU : Alignement centre vertical ***
      if (Math.abs(elementCenterY - otherCenterY) <= tolerance) {
        snappedY = otherCenterY - element.height / 2;
        hasSnapped = true;
        guides.push({
          id: `element-${index}-center-v`,
          type: 'horizontal',
          position: otherCenterY,
          color: '#e056fd', // Violet magenta - nouvelle couleur
          opacity: 1,
          label: 'Centre Vertical'
        });
      }
    });

    // 4. Snap à la grille (si activée)
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
          color: '#a0a0a0', // Gris neutre pour la grille
          opacity: 0.5,
          label: 'Grille'
        });
      }

      if (Math.abs(element.y - gridY) <= tolerance) {
        snappedY = gridY;
        hasSnapped = true;
        guides.push({
          id: `grid-y-${gridY}`,
          type: 'horizontal',
          position: gridY,
          color: '#a0a0a0', // Gris neutre pour la grille
          opacity: 0.5,
          label: 'Grille'
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
    elements: Element[],
    direction: 'horizontal' | 'vertical',
    spacing?: number
  ): Array<{ id: string; x: number; y: number }> {
    if (elements.length < 2) return [];

    const sorted = [...elements].sort((a, b) => 
      direction === 'horizontal' ? a.x - b.x : a.y - b.y
    );

    const result: Array<{ id: string; x: number; y: number }> = [];

    if (spacing !== undefined) {
      // Espacement fixe
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
      // Distribution égale
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpace = direction === 'horizontal' 
        ? (last.x + last.width) - first.x
        : (last.y + last.height) - first.y;
      
      const stepSize = totalSpace / (sorted.length - 1);
      
      sorted.forEach((element, index) => {
        const pos = (direction === 'horizontal' ? first.x : first.y) + (stepSize * index);
        result.push({
          id: element.id,
          x: direction === 'horizontal' ? pos : element.x,
          y: direction === 'vertical' ? pos : element.y
        });
      });
    }

    return result;
  }

  // Configuration
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

export default AlignmentEngine;

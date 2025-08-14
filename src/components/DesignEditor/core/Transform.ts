// Transform.ts – conversions viewport <-> canvas (scene)
// Basé sur les utilitaires Excalidraw (MIT) pour une précision absolue

export type Viewport = { 
  zoom: number; 
  scrollX: number; 
  scrollY: number; 
  panX?: number; 
  panY?: number 
};

/**
 * Convertit les coordonnées viewport (clientX/Y) en coordonnées canvas
 * Équivalent de viewportCoordsToSceneCoords (Excalidraw)
 */
export function viewportToCanvas(clientX: number, clientY: number, vp: Viewport) {
  const x = (clientX - (vp.panX ?? 0)) / vp.zoom - vp.scrollX;
  const y = (clientY - (vp.panY ?? 0)) / vp.zoom - vp.scrollY;
  return { x, y };
}

/**
 * Convertit les coordonnées canvas en coordonnées viewport
 * Équivalent de sceneCoordsToViewportCoords (Excalidraw)
 */
export function canvasToViewport(sceneX: number, sceneY: number, vp: Viewport) {
  const x = (sceneX + vp.scrollX) * vp.zoom + (vp.panX ?? 0);
  const y = (sceneY + vp.scrollY) * vp.zoom + (vp.panY ?? 0);
  return { x, y };
}

/**
 * Calcule le viewport basé sur un élément canvas et ses transformations
 */
export function getCanvasViewport(canvasElement: HTMLElement): Viewport {
  const rect = canvasElement.getBoundingClientRect();
  
  // Pour l'instant, viewport simple (pas de zoom/pan)
  // À étendre selon les besoins du canvas
  return {
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
    panX: rect.left,
    panY: rect.top
  };
}

/**
 * Recalcule les offsets après déplacement du conteneur
 * Équivalent de refresh() (Excalidraw)
 */
export function refreshViewport(canvasElement: HTMLElement): Viewport {
  return getCanvasViewport(canvasElement);
}

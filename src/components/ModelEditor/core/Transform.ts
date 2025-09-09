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

  // Extraire le zoom depuis le style transform de l'élément (scale)
  // Supporte matrix() et matrix3d(); si aucun transform, zoom = 1
  let zoom = 1;
  try {
    const style = getComputedStyle(canvasElement);
    const transform = style.transform || style.webkitTransform || 'none';
    if (transform && transform !== 'none') {
      // matrix(a, b, c, d, tx, ty) => scaleX = sqrt(a^2 + b^2)
      // matrix3d(m11, m12, ..., m44) => scaleX = sqrt(m11^2 + m12^2 + m13^2)
      if (transform.startsWith('matrix3d(')) {
        const parts = transform.slice(9, -1).split(',').map((v) => parseFloat(v.trim()));
        // m11, m12, m13
        const m11 = parts[0], m12 = parts[1], m13 = parts[2];
        const scaleX = Math.sqrt(m11 * m11 + m12 * m12 + m13 * m13) || 1;
        zoom = scaleX;
      } else if (transform.startsWith('matrix(')) {
        const parts = transform.slice(7, -1).split(',').map((v) => parseFloat(v.trim()));
        const a = parts[0], b = parts[1];
        const scaleX = Math.sqrt(a * a + b * b) || 1;
        zoom = scaleX;
      } else if (transform.startsWith('scale(')) {
        // Fallback si le navigateur retourne directement scale(x)
        const s = parseFloat(transform.slice(6, -1));
        if (!Number.isNaN(s) && s > 0) zoom = s;
      }
    }
  } catch {
    // Ignore parsing errors; default to 1
    zoom = 1;
  }

  return {
    zoom,
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

// Drag.ts – drag précis: le point cliqué reste sous le curseur
// Basé sur les techniques Excalidraw/Konva pour une précision absolue

import React from 'react';
import { viewportToCanvas, Viewport } from "./Transform";

export type Item = { 
  x: number; 
  y: number; 
  w: number; 
  h: number 
};

export type DragState = {
  started: boolean;
  start: { x: number; y: number };
  offset: { x: number; y: number };
};

/**
 * Crée un système de drag ultra-précis
 * Le point cliqué reste exactement sous le curseur pendant tout le drag
 */
export function createPreciseDrag(
  getViewport: () => Viewport,
  getItem: () => Item,
  setItemPos: (x: number, y: number) => void,
  thresholdPx = 4
) {
  const state: DragState = { 
    started: false, 
    start: { x: 0, y: 0 }, 
    offset: { x: 0, y: 0 } 
  };

  function onPointerDown(e: PointerEvent, hostEl: HTMLElement) {
    const vp = getViewport();
    const p0 = viewportToCanvas(e.clientX, e.clientY, vp);
    state.start = p0;
    state.started = false;

    const move = (ev: PointerEvent) => {
      const p = viewportToCanvas(ev.clientX, ev.clientY, getViewport());
      
      if (!state.started) {
        // Vérifier le seuil avant de démarrer le drag
        const dx = p.x - state.start.x;
        const dy = p.y - state.start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < thresholdPx) return;

        // Initialiser le drag: calcule l'offset EXACT au moment du grab
        const item = getItem();
        state.offset = { 
          x: state.start.x - item.x, 
          y: state.start.y - item.y 
        };
        state.started = true;
        ev.preventDefault();
        
        // Capturer le pointeur pour un suivi précis
        if (hostEl.setPointerCapture) {
          hostEl.setPointerCapture(e.pointerId);
        }
        
        // Optimisations pour le rendu
        hostEl.style.willChange = 'transform';
        hostEl.style.pointerEvents = 'none';
      }
      
      if (state.started) {
        // Position précise: point cliqué reste sous le curseur
        const nx = p.x - state.offset.x;
        const ny = p.y - state.offset.y;
        
        // Mise à jour avec précision sub-pixel
        setItemPos(nx, ny);
      }
    };

    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
      
      // Nettoyage
      if (hostEl.releasePointerCapture) {
        hostEl.releasePointerCapture(e.pointerId);
      }
      hostEl.style.willChange = 'auto';
      hostEl.style.pointerEvents = 'auto';
      
      state.started = false;
    };

    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointercancel", up, { passive: true });
  }

  return { 
    onPointerDown,
    isActive: () => state.started,
    getState: () => ({ ...state })
  };
}

/**
 * Hook React pour utiliser le drag précis
 */
export function usePreciseDrag(
  getViewport: () => Viewport,
  item: Item,
  onUpdate: (x: number, y: number) => void,
  threshold = 4
) {
  const dragRef = React.useRef(
    createPreciseDrag(
      getViewport,
      () => item,
      onUpdate,
      threshold
    )
  );

  // Mettre à jour les références
  React.useEffect(() => {
    dragRef.current = createPreciseDrag(
      getViewport,
      () => item,
      onUpdate,
      threshold
    );
  }, [getViewport, item, onUpdate, threshold]);

  return dragRef.current;
}

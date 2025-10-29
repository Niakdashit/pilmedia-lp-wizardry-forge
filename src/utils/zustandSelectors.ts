import { useCallback } from 'react';
import { shallow } from 'zustand/shallow';

/**
 * Utilitaires pour optimiser les sélecteurs Zustand
 * Évite les re-renders inutiles en utilisant shallow equality
 */

/**
 * Crée un sélecteur optimisé avec shallow comparison
 * Usage: const data = useStore(createSelector((state) => ({ x: state.x, y: state.y })))
 */
export function createSelector<T, R>(selector: (state: T) => R) {
  return (state: T) => selector(state);
}

/**
 * Crée un sélecteur pour plusieurs propriétés avec shallow equality
 * Usage: const { x, y } = useStore(selectMultiple(['x', 'y']))
 */
export function selectMultiple<T extends Record<string, any>, K extends keyof T>(
  keys: K[]
): (state: T) => Pick<T, K> {
  return (state: T) => {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      result[key] = state[key];
    });
    return result;
  };
}

/**
 * HOC pour mémoriser les sélecteurs de store
 */
export function withShallowEqual<T>(selector: (state: any) => T) {
  return (state: any) => shallow(selector(state), selector(state));
}

/**
 * Sélecteur optimisé pour les actions (évite les re-renders)
 * Usage: const actions = useStore(selectActions)
 */
export function selectActions<T extends Record<string, any>>(
  actionKeys: (keyof T)[]
): (state: T) => Pick<T, typeof actionKeys[number]> {
  return (state: T) => {
    const actions = {} as any;
    actionKeys.forEach((key) => {
      if (typeof state[key] === 'function') {
        actions[key] = state[key];
      }
    });
    return actions;
  };
}

/**
 * Hook personnalisé pour créer des sélecteurs mémorisés
 */
export function useMemoizedSelector<T, R>(
  store: (selector: (state: T) => R, equalityFn?: (a: R, b: R) => boolean) => R,
  selector: (state: T) => R
): R {
  const memoizedSelector = useCallback(selector, []);
  return store(memoizedSelector, shallow);
}

/**
 * Sélecteur pour un seul champ (ultra-optimisé)
 */
export function selectField<T, K extends keyof T>(field: K): (state: T) => T[K] {
  return (state: T) => state[field];
}

/**
 * Sélecteur avec transformation (mémorisé automatiquement)
 */
export function selectTransform<T, R>(
  selector: (state: T) => any,
  transform: (value: any) => R
): (state: T) => R {
  return (state: T) => transform(selector(state));
}

/**
 * Exemple d'utilisation avec le editorStore
 */
export const editorSelectors = {
  // Sélectionne uniquement la campagne active
  campaign: (state: any) => state.campaign,
  
  // Sélectionne l'ID de campagne
  campaignId: (state: any) => state.selectedCampaignId,
  
  // Sélectionne les données de preview
  previewData: (state: any) => ({
    device: state.previewDevice,
    zoom: state.canvasZoom,
    isPreview: state.isPreviewMode,
  }),
  
  // Sélectionne uniquement les actions
  actions: (state: any) => ({
    setCampaign: state.setCampaign,
    updateCampaign: state.updateCampaign,
    setPreviewDevice: state.setPreviewDevice,
    setCanvasZoom: state.setCanvasZoom,
  }),
  
  // Sélectionne l'état de drag
  dragState: (state: any) => ({
    isDragging: state.isDragging,
    draggedElementId: state.draggedElementId,
    draggedElementType: state.draggedElementType,
  }),
};

/**
 * Exemple d'utilisation avec le buttonStore
 */
export const buttonSelectors = {
  style: (state: any) => state.buttonStyle,
  actions: (state: any) => ({
    setButtonStyle: state.setButtonStyle,
    resetButtonStyle: state.resetButtonStyle,
  }),
};

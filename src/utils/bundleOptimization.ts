/**
 * Utilitaires pour optimiser le bundle et réduire la taille des imports
 */

// Import seulement les fonctions nécessaires de lodash-es
import debounce from 'lodash-es/debounce';
import throttle from 'lodash-es/throttle';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import merge from 'lodash-es/merge';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';

export { debounce, throttle, cloneDeep, isEqual, merge, pick, omit };

/**
 * Optimisation des images - lazy loading
 */
export const getOptimizedImageProps = (src: string, alt: string) => ({
  src,
  alt,
  loading: 'lazy' as const,
  decoding: 'async' as const,
});

/**
 * Précharger les ressources critiques
 */
export const preloadCriticalAssets = () => {
  const criticalFonts = [
    '/fonts/inter-var.woff2',
    // Ajouter d'autres fonts critiques ici
  ];

  criticalFonts.forEach((fontUrl) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = fontUrl;
    document.head.appendChild(link);
  });
};

/**
 * Nettoyer les resources inutilisées
 */
export const cleanupUnusedResources = () => {
  // Nettoyer les event listeners obsolètes
  if (typeof window !== 'undefined') {
    const oldListeners = (window as any).__eventListeners || [];
    oldListeners.forEach((listener: any) => {
      if (listener.cleanup) {
        listener.cleanup();
      }
    });
    (window as any).__eventListeners = [];
  }
};

/**
 * Compresser les données JSON avant de les sauvegarder
 */
export const compressJSON = (data: any): string => {
  return JSON.stringify(data, null, 0);
};

/**
 * Optimiser les requêtes réseau avec cache intelligent
 */
export class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxAge: number;

  constructor(maxAge: number = 5 * 60 * 1000) {
    // 5 minutes par défaut
    this.maxAge = maxAge;
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.maxAge;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Instance globale du cache de requêtes
 */
export const globalRequestCache = new RequestCache();

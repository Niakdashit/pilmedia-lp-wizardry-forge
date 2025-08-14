import { useCallback, useRef, useState, useEffect } from 'react';
import { throttle } from 'lodash-es';

interface CanvasRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  isDirty: boolean;
  lastUpdate: number;
}

interface VirtualizedCanvasOptions {
  containerRef: React.RefObject<HTMLElement> | React.RefObject<HTMLDivElement> | ((instance: HTMLDivElement | null) => void);
  regionSize?: number;
  maxRegions?: number;
  updateThreshold?: number;
}

interface CanvasElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  lastModified?: number;
}

export const useVirtualizedCanvas = ({
  containerRef,
  regionSize = 200,
  maxRegions = 50,
  updateThreshold = 16 // 60fps
}: VirtualizedCanvasOptions) => {
  const regionsRef = useRef<Map<string, CanvasRegion>>(new Map());
  const [visibleRegions, setVisibleRegions] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const rafRef = useRef<number>();

  // Calculer quelle région contient un point
  const getRegionKey = useCallback((x: number, y: number) => {
    const regionX = Math.floor(x / regionSize);
    const regionY = Math.floor(y / regionSize);
    return `${regionX},${regionY}`;
  }, [regionSize]);

  // Calculer les régions affectées par un élément
  const getAffectedRegions = useCallback((element: CanvasElement): string[] => {
    const regions: string[] = [];
    const startX = Math.floor(element.x / regionSize);
    const endX = Math.floor((element.x + element.width) / regionSize);
    const startY = Math.floor(element.y / regionSize);
    const endY = Math.floor((element.y + element.height) / regionSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        regions.push(`${x},${y}`);
      }
    }
    return regions;
  }, [regionSize]);

  // Marquer les régions comme dirty
  const markRegionsDirty = useCallback((elements: CanvasElement[]) => {
    const now = Date.now();
    const regions = regionsRef.current;
    
    elements.forEach(element => {
      const affectedRegions = getAffectedRegions(element);
      affectedRegions.forEach(regionKey => {
        const existing = regions.get(regionKey);
        regions.set(regionKey, {
          x: parseInt(regionKey.split(',')[0]) * regionSize,
          y: parseInt(regionKey.split(',')[1]) * regionSize,
          width: regionSize,
          height: regionSize,
          isDirty: true,
          lastUpdate: existing?.lastUpdate || now
        });
      });
    });

    setIsDirty(true);
  }, [getAffectedRegions, regionSize]);

  // Calculer les régions visibles dans le viewport
  const updateVisibleRegions = useCallback(() => {
    if (!containerRef || typeof containerRef === 'function' || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft || 0;
    const scrollTop = container.scrollTop || 0;

    const viewportLeft = scrollLeft;
    const viewportTop = scrollTop;
    const viewportRight = scrollLeft + rect.width;
    const viewportBottom = scrollTop + rect.height;

    const visible = new Set<string>();
    
    // Ajouter une marge pour le pré-chargement
    const margin = regionSize;
    const startX = Math.floor((viewportLeft - margin) / regionSize);
    const endX = Math.ceil((viewportRight + margin) / regionSize);
    const startY = Math.floor((viewportTop - margin) / regionSize);
    const endY = Math.ceil((viewportBottom + margin) / regionSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        visible.add(`${x},${y}`);
      }
    }

    setVisibleRegions(visible);
  }, [containerRef, regionSize]);

  // Throttled update pour les performances
  const throttledUpdate = useCallback(
    throttle(() => {
      updateVisibleRegions();
    }, updateThreshold),
    [updateVisibleRegions, updateThreshold]
  );

  // Nettoyer les régions non utilisées
  const cleanupRegions = useCallback(() => {
    const regions = regionsRef.current;
    const now = Date.now();
    const maxAge = 30000; // 30 secondes

    if (regions.size > maxRegions) {
      const sortedRegions = Array.from(regions.entries())
        .sort(([, a], [, b]) => a.lastUpdate - b.lastUpdate);
      
      // Supprimer les plus anciennes
      const toRemove = sortedRegions.slice(0, regions.size - maxRegions);
      toRemove.forEach(([key]) => regions.delete(key));
    }

    // Supprimer les régions trop anciennes
    for (const [key, region] of regions.entries()) {
      if (now - region.lastUpdate > maxAge && !visibleRegions.has(key)) {
        regions.delete(key);
      }
    }
  }, [maxRegions, visibleRegions]);

  // Optimiser le rendu avec requestAnimationFrame
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= updateThreshold) {
        throttledUpdate();
        cleanupRegions();
        lastUpdateRef.current = now;
        setIsDirty(false);
      }
    });
  }, [throttledUpdate, cleanupRegions, updateThreshold]);

  // Effet pour les mises à jour automatiques
  useEffect(() => {
    if (isDirty) {
      scheduleUpdate();
    }
  }, [isDirty, scheduleUpdate]);

  // Effet pour le scroll et resize
  useEffect(() => {
    if (!containerRef || typeof containerRef === 'function') return;
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => throttledUpdate();
    const handleResize = () => throttledUpdate();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Mise à jour initiale
    updateVisibleRegions();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef, throttledUpdate, updateVisibleRegions]);

  // Vérifier si un élément est dans une région visible
  const isElementVisible = useCallback((element: CanvasElement): boolean => {
    const affectedRegions = getAffectedRegions(element);
    return affectedRegions.some(region => visibleRegions.has(region));
  }, [getAffectedRegions, visibleRegions]);

  // Obtenir les régions dirty visibles
  const getDirtyVisibleRegions = useCallback((): CanvasRegion[] => {
    const regions = regionsRef.current;
    const dirtyRegions: CanvasRegion[] = [];

    for (const regionKey of visibleRegions) {
      const region = regions.get(regionKey);
      if (region?.isDirty) {
        dirtyRegions.push(region);
      }
    }

    return dirtyRegions;
  }, [visibleRegions]);

  // Marquer les régions comme propres après rendu
  const markRegionsClean = useCallback((regionKeys: string[]) => {
    const regions = regionsRef.current;
    regionKeys.forEach(key => {
      const region = regions.get(key);
      if (region) {
        region.isDirty = false;
        region.lastUpdate = Date.now();
      }
    });
  }, []);

  return {
    // État
    visibleRegions,
    isDirty,
    
    // Méthodes
    markRegionsDirty,
    isElementVisible,
    getDirtyVisibleRegions,
    markRegionsClean,
    updateVisibleRegions,
    
    // Utilitaires
    getRegionKey,
    getAffectedRegions,
    
    // Statistiques
    totalRegions: regionsRef.current.size,
    visibleRegionsCount: visibleRegions.size
  };
};

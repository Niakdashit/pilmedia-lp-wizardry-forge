import { useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash-es';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

/**
 * Hook personnalisé pour optimiser les performances de rendu
 * Mesure et optimise les re-renders des composants
 */
export const usePerformanceOptimization = (componentName: string) => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  const renderStartTimeRef = useRef<number>(0);

  // Mesurer le début du rendu
  renderStartTimeRef.current = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - renderStartTimeRef.current;
    const metrics = metricsRef.current;
    
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

    // Logger si le rendu est lent (> 16ms = 60fps)
    if (renderTime > 16 && process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [Performance] ${componentName} - Slow render: ${renderTime.toFixed(2)}ms`);
    }

    // Logger les statistiques tous les 10 renders en dev
    if (metrics.renderCount % 10 === 0 && process.env.NODE_ENV === 'development') {
      console.log(`📊 [Performance] ${componentName} Stats:`, {
        totalRenders: metrics.renderCount,
        lastRender: `${metrics.lastRenderTime.toFixed(2)}ms`,
        avgRender: `${metrics.averageRenderTime.toFixed(2)}ms`,
      });
    }
  });

  return {
    renderCount: metricsRef.current.renderCount,
    lastRenderTime: metricsRef.current.lastRenderTime,
    averageRenderTime: metricsRef.current.averageRenderTime,
  };
};

/**
 * Hook pour debouncer les mises à jour fréquentes
 */
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
) => {
  const debouncedFn = useRef(debounce(callback, delay)).current;

  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return useCallback(debouncedFn, [debouncedFn]);
};

/**
 * Hook pour throttler les mises à jour intensives (ex: scroll, resize)
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 100
) => {
  const inThrottle = useRef(false);
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        lastRun.current = Date.now();
        inThrottle.current = true;

        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
};

/**
 * Hook pour détecter les re-renders inutiles
 */
export const useWhyDidYouUpdate = (name: string, props: Record<string, any>) => {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`🔄 [WhyDidYouUpdate] ${name}:`, changedProps);
      }
    }

    previousProps.current = props;
  });
};

/**
 * Hook pour mesurer le temps de montage d'un composant
 */
export const useMountTime = (componentName: string) => {
  const mountStartTime = useRef(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - mountStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ [MountTime] ${componentName}: ${mountTime.toFixed(2)}ms`);
    }

    // Logger si le montage est lent (> 100ms)
    if (mountTime > 100) {
      console.warn(`⚠️ [Performance] ${componentName} - Slow mount: ${mountTime.toFixed(2)}ms`);
    }
  }, [componentName]);
};

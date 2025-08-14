import { useMemo, useCallback, useState, useRef } from 'react';
import { throttle } from 'lodash-es';

interface PreviewCache {
  [key: string]: {
    timestamp: number;
    data: any;
  };
}

export const usePreviewOptimization = (campaign: any, previewDevice: string) => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const cacheRef = useRef<PreviewCache>({});
  const CACHE_DURATION = 5000; // 5 seconds

  // Generate stable cache key
  const cacheKey = useMemo(() => {
    const relevantData = {
      type: campaign.type,
      gameConfig: campaign.gameConfig,
      design: campaign.design,
      buttonConfig: campaign.buttonConfig,
      device: previewDevice,
      version: campaign._version || 0
    };
    return JSON.stringify(relevantData);
  }, [campaign, previewDevice]);

  // Check cache validity
  const getCachedPreview = useCallback((key: string) => {
    const cached = cacheRef.current[key];
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      delete cacheRef.current[key];
      return null;
    }
    
    return cached.data;
  }, []);

  // Cache preview data
  const setCachedPreview = useCallback((key: string, data: any) => {
    cacheRef.current[key] = {
      timestamp: Date.now(),
      data
    };
    
    // Clean old cache entries
    const now = Date.now();
    Object.keys(cacheRef.current).forEach(k => {
      if (now - cacheRef.current[k].timestamp > CACHE_DURATION) {
        delete cacheRef.current[k];
      }
    });
  }, []);

  // Throttled preview update
  const throttledPreviewUpdate = useCallback(
    throttle((callback: () => void) => {
      setIsPreviewLoading(true);
      setTimeout(() => {
        callback();
        setIsPreviewLoading(false);
      }, 100);
    }, 200),
    []
  );

  // Optimized preview config
  const optimizedPreviewConfig = useMemo(() => {
    const cached = getCachedPreview(cacheKey);
    if (cached) return cached;

    const config = {
      campaign: {
        ...campaign,
        // Remove unnecessary data for preview
        _metadata: undefined,
        _debug: undefined,
        _error: undefined,
        _errorMessage: undefined
      },
      device: previewDevice,
      timestamp: Date.now()
    };

    setCachedPreview(cacheKey, config);
    return config;
  }, [campaign, previewDevice, cacheKey, getCachedPreview, setCachedPreview]);

  return {
    optimizedPreviewConfig,
    isPreviewLoading,
    throttledPreviewUpdate,
    cacheKey
  };
};
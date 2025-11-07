import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Cache en mémoire pour chargement instantané
const campaignCache = new Map<string, any>();
const imagePreloadCache = new Set<string>();

// Précharge une image
const preloadImage = (url: string): Promise<void> => {
  if (!url || imagePreloadCache.has(url)) return Promise.resolve();
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imagePreloadCache.add(url);
      resolve();
    };
    img.onerror = () => resolve(); // Continue même en cas d'erreur
    img.src = url;
  });
};

// Extrait toutes les URLs d'images d'une campagne
const extractImageUrls = (campaign: any): string[] => {
  const urls: string[] = [];
  
  // Images de fond par écran et device
  if (campaign.backgrounds) {
    Object.values(campaign.backgrounds).forEach((screenBg: any) => {
      if (screenBg) {
        ['desktop', 'tablet', 'mobile'].forEach(device => {
          const deviceBg = screenBg[device];
          if (deviceBg?.backgroundImage?.url) {
            urls.push(deviceBg.backgroundImage.url);
          }
        });
      }
    });
  }

  // Images des modules
  if (campaign.modularPages) {
    Object.values(campaign.modularPages).forEach((page: any) => {
      page?.modules?.forEach((module: any) => {
        if (module.type === 'image' && module.src) {
          urls.push(module.src);
        }
        if (module.image?.url) {
          urls.push(module.image.url);
        }
        if (module.backgroundImage?.url) {
          urls.push(module.backgroundImage.url);
        }
      });
    });
  }

  // Logo de la roue
  if (campaign.design?.centerLogo) {
    urls.push(campaign.design.centerLogo);
  }

  // Article mode images
  if (campaign.articleConfig) {
    if (campaign.articleConfig.bannerImage) urls.push(campaign.articleConfig.bannerImage);
    if (campaign.articleConfig.logoImage) urls.push(campaign.articleConfig.logoImage);
  }

  return urls.filter(Boolean);
};

interface UseFastCampaignLoaderOptions {
  campaignId: string | null;
  enabled?: boolean;
}

export const useFastCampaignLoader = ({ 
  campaignId, 
  enabled = true 
}: UseFastCampaignLoaderOptions) => {
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  // Précharge les images d'une campagne
  const preloadCampaignImages = useCallback(async (campaignData: any) => {
    if (!campaignData) return;
    
    const imageUrls = extractImageUrls(campaignData);
    
    // Précharge toutes les images en parallèle (max 10 simultanées)
    const batchSize = 10;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(preloadImage));
    }
  }, []);

  // Charge la campagne avec cache et préchargement
  const loadCampaign = useCallback(async (id: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      // 1. Vérifier le cache d'abord (chargement instantané)
      const cached = campaignCache.get(id);
      if (cached && mountedRef.current) {
        setCampaign(cached);
        setIsLoading(false);
        // Précharger les images en arrière-plan
        preloadCampaignImages(cached);
        
        // CRITICAL: Fetch fresh data from server in background
        (async () => {
          try {
            const { data: freshData } = await supabase
              .from('campaigns')
              .select('*')
              .eq('id', id)
              .single();
            
            if (freshData && mountedRef.current) {
              // Compare revision or updated_at
              const cachedRevision = cached.revision || 0;
              const freshRevision = freshData.revision || 0;
              const cachedUpdatedAt = new Date(cached.updated_at || 0).getTime();
              const freshUpdatedAt = new Date(freshData.updated_at || 0).getTime();
              
              if (freshRevision > cachedRevision || freshUpdatedAt > cachedUpdatedAt) {
                console.log('🔄 [FastLoader] Server has newer version, updating cache');
                const parsedFreshData = {
                  ...freshData,
                  config: typeof freshData.config === 'string' ? JSON.parse(freshData.config) : freshData.config,
                  modularPages: typeof (freshData as any).modular_pages === 'string' 
                    ? JSON.parse((freshData as any).modular_pages) 
                    : (freshData as any).modular_pages,
                  backgrounds: typeof (freshData as any).backgrounds === 'string'
                    ? JSON.parse((freshData as any).backgrounds)
                    : (freshData as any).backgrounds,
                  articleConfig: typeof freshData.article_config === 'string'
                    ? JSON.parse(freshData.article_config)
                    : freshData.article_config
                };
                campaignCache.set(id, parsedFreshData);
                setCampaign(parsedFreshData);
              }
            }
          } catch (error) {
            console.warn('[FastLoader] Background refresh failed:', error);
          }
        })();
        
        loadingRef.current = false;
        return cached;
      }

      // 2. Charger depuis Supabase
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (data && mountedRef.current) {
        // Parser la config si nécessaire
        const rawData = data as any;
        const parsedData = {
          ...rawData,
          config: typeof rawData.config === 'string' ? JSON.parse(rawData.config) : rawData.config,
          modularPages: typeof rawData.modular_pages === 'string' 
            ? JSON.parse(rawData.modular_pages) 
            : rawData.modular_pages,
          backgrounds: typeof rawData.backgrounds === 'string'
            ? JSON.parse(rawData.backgrounds)
            : rawData.backgrounds,
          articleConfig: typeof rawData.article_config === 'string'
            ? JSON.parse(rawData.article_config)
            : rawData.article_config
        };

        // Mettre en cache
        campaignCache.set(id, parsedData);

        // Afficher immédiatement
        setCampaign(parsedData);
        setIsLoading(false);

        // Précharger les images en arrière-plan
        preloadCampaignImages(parsedData);

        loadingRef.current = false;
        return parsedData;
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
      if (mountedRef.current) {
        setError(err as Error);
        setIsLoading(false);
      }
      loadingRef.current = false;
    }
  }, [preloadCampaignImages]);

  // Charge la campagne au montage
  useEffect(() => {
    mountedRef.current = true;
    
    if (!enabled || !campaignId) {
      setIsLoading(false);
      return;
    }

    loadCampaign(campaignId);

    return () => {
      mountedRef.current = false;
    };
  }, [campaignId, enabled, loadCampaign]);

  // Fonction pour mettre à jour le cache
  const updateCache = useCallback((id: string, data: any) => {
    campaignCache.set(id, data);
    if (id === campaignId) {
      setCampaign(data);
    }
  }, [campaignId]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback((id?: string) => {
    if (id) {
      campaignCache.delete(id);
    } else {
      campaignCache.clear();
    }
  }, []);

  return {
    campaign,
    isLoading,
    error,
    reload: () => campaignId && loadCampaign(campaignId),
    updateCache,
    invalidateCache
  };
};

// Hook pour précharger les images d'une campagne sans la charger complètement
export const usePreloadCampaignImages = (campaign: any) => {
  const hasPreloaded = useRef(false);

  useEffect(() => {
    if (!campaign || hasPreloaded.current) return;
    
    hasPreloaded.current = true;
    const imageUrls = extractImageUrls(campaign);
    
    // Précharge en arrière-plan
    Promise.allSettled(imageUrls.map(preloadImage));
  }, [campaign]);
};

import { useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';

/**
 * Hook pour synchroniser les uploads d'images avec la bannière article
 * Écoute les événements émis par BackgroundPanel et met à jour campaign.articleConfig.banner.imageUrl
 * 
 * Usage: Appeler dans HybridSidebar de chaque éditeur en mode article
 */
export const useArticleBannerSync = (editorMode: 'fullscreen' | 'article') => {
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);

  useEffect(() => {
    console.log('🎨 [useArticleBannerSync] Setup:', { editorMode, hasCampaign: !!campaign });
    if (editorMode !== 'article') return;

    const handleApplyBackgroundCurrent = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string } | undefined;
      const url = detail?.url;
      console.log('🎨 [useArticleBannerSync] Received applyBackgroundCurrentScreen:', { url, hasCampaign: !!campaign });
      
      if (!url) {
        console.warn('⚠️ [useArticleBannerSync] No URL in event');
        return;
      }
      
      if (!campaign) {
        console.warn('⚠️ [useArticleBannerSync] No campaign in store, creating new one');
        setCampaign({
          name: 'Article Campaign',
          type: 'scratch',
          editorMode: 'article',
          articleConfig: {
            banner: {
              imageUrl: url,
            },
          },
        } as any);
        return;
      }
      
      console.log('🎨 [useArticleBannerSync] Updating campaign with banner:', url);
      setCampaign({
        ...campaign,
        articleConfig: {
          ...campaign.articleConfig,
          banner: {
            ...campaign.articleConfig?.banner,
            imageUrl: url,
          },
        },
      });
    };

    const handleApplyBackgroundAll = (e: Event) => {
      const detail = (e as CustomEvent<any>)?.detail as { url?: string } | undefined;
      const url = detail?.url;
      console.log('🎨 [useArticleBannerSync] Received applyBackgroundAllScreens:', { url, hasCampaign: !!campaign });
      
      if (!url) return;
      
      if (!campaign) {
        setCampaign({
          name: 'Article Campaign',
          type: 'scratch',
          editorMode: 'article',
          articleConfig: {
            banner: {
              imageUrl: url,
            },
          },
        } as any);
        return;
      }
      
      setCampaign({
        ...campaign,
        articleConfig: {
          ...campaign.articleConfig,
          banner: {
            ...campaign.articleConfig?.banner,
            imageUrl: url,
          },
        },
      });
    };

    console.log('🎨 [useArticleBannerSync] Adding event listeners');
    window.addEventListener('applyBackgroundCurrentScreen', handleApplyBackgroundCurrent as EventListener);
    window.addEventListener('applyBackgroundAllScreens', handleApplyBackgroundAll as EventListener);

    return () => {
      console.log('🎨 [useArticleBannerSync] Removing event listeners');
      window.removeEventListener('applyBackgroundCurrentScreen', handleApplyBackgroundCurrent as EventListener);
      window.removeEventListener('applyBackgroundAllScreens', handleApplyBackgroundAll as EventListener);
    };
  }, [editorMode, campaign, setCampaign]);
};

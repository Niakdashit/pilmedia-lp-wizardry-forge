import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCampaigns } from './useCampaigns';
import { useEditorStore } from '@/stores/editorStore';

export const useCampaignFromUrl = () => {
  const [searchParams] = useSearchParams();
  const { getCampaign } = useCampaigns();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're starting a new campaign from dashboard
  const isNewCampaignGlobal = useEditorStore(s => s.isNewCampaignGlobal);
  const clearNewCampaignFlag = useEditorStore(s => s.clearNewCampaignFlag);

  useEffect(() => {
    const loadCampaign = async () => {
      const campaignId = searchParams.get('campaign');
      // Instrumentation for debugging
      console.log('[useCampaignFromUrl] init', { campaignId, isNewCampaignGlobal });

      // ✅ Skip auto-load ONLY when starting fresh (no id present)
      if (isNewCampaignGlobal && !campaignId) {
        console.log('🚫 [useCampaignFromUrl] Skipping auto-load (fresh new campaign, no id)');
        clearNewCampaignFlag();
        setLoading(false);
        return;
      }

      // If flag is set but an id is present, clear the flag and proceed with DB load
      if (isNewCampaignGlobal && campaignId) {
        console.log('🔄 [useCampaignFromUrl] Clearing new-campaign flag and loading existing campaign', campaignId);
        clearNewCampaignFlag();
      }

      if (!campaignId) {
        console.log('[useCampaignFromUrl] No campaign id in URL, nothing to load');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('[useCampaignFromUrl] Loading campaign from DB…', campaignId);

        const loadedCampaign = await getCampaign(campaignId);
        if (loadedCampaign) {
          setCampaign(loadedCampaign);

          // Instrumentation about modularPage
          const modular = loadedCampaign?.config?.modularPage || loadedCampaign?.design?.modularPage;
          const screens = modular?.screens || [];
          const modulesCount = screens.reduce((acc: number, s: any) => acc + (s?.modules?.length || 0), 0);
          console.log('[useCampaignFromUrl] Campaign loaded', {
            id: loadedCampaign?.id || campaignId,
            type: loadedCampaign?.type,
            screensCount: screens.length,
            modulesCount
          });
          (window as any).__campaignLoaded = {
            id: loadedCampaign?.id || campaignId,
            at: Date.now(),
            screensCount: screens.length,
            modulesCount
          };
        } else {
          console.warn('[useCampaignFromUrl] Campaign not found', campaignId);
          setError('Campagne non trouvée');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
        console.error('[useCampaignFromUrl] Error while loading', { campaignId, err });
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [searchParams, isNewCampaignGlobal, getCampaign, clearNewCampaignFlag]);

  return { campaign, loading, error };
};

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

      // 🚫 CRITICAL: Don't load campaign if we're starting fresh from dashboard
      if (isNewCampaignGlobal) {
        console.log('🚫 [useCampaignFromUrl] Skipping auto-load - new campaign from dashboard');
        clearNewCampaignFlag();
        setLoading(false);
        return;
      }

      if (!campaignId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const loadedCampaign = await getCampaign(campaignId);
        if (loadedCampaign) {
          setCampaign(loadedCampaign);
        } else {
          setError('Campagne non trouvée');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [searchParams]);

  return { campaign, loading, error };
};

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCampaigns } from './useCampaigns';

export const useCampaignFromUrl = () => {
  const [searchParams] = useSearchParams();
  const { getCampaign } = useCampaigns();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      const campaignId = searchParams.get('campaign');

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

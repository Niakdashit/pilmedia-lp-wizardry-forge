// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MediaCampaign } from '@/types/media';
import { useProfile } from '../useProfile';

export const useMediaCampaigns = (overrideMediaId?: string) => {
  const { profile } = useProfile();
  const [campaigns, setCampaigns] = useState<MediaCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('media_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (overrideMediaId) {
        query.eq('media_id', overrideMediaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCampaigns((data ?? []) as MediaCampaign[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, overrideMediaId]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}

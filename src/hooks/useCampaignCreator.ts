import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CampaignCreator {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

export const useCampaignCreator = (createdBy: string | null) => {
  const [creator, setCreator] = useState<CampaignCreator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!createdBy) {
      setLoading(false);
      return;
    }

    const fetchCreator = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('id', createdBy)
          .single();

        if (error) throw error;
        setCreator(data);
      } catch (err) {
        console.error('Error fetching creator:', err);
        setCreator(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [createdBy]);

  return { creator, loading };
};

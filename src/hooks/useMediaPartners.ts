// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MediaPartner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  category: string | null;
  audience_size: number;
  monthly_visitors: number;
  contact_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useMediaPartners = () => {
  const [mediaPartners, setMediaPartners] = useState<MediaPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaPartners = async (category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('media_partners')
        .select('*')
        .eq('status', 'active')
        .order('audience_size', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMediaPartners(data as MediaPartner[]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaPartners();
  }, []);

  return {
    mediaPartners,
    loading,
    error,
    refetch: fetchMediaPartners
  };
};

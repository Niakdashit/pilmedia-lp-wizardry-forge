import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PartnershipRequest } from '@/types/media';
import { useProfile } from '../useProfile';

export const usePartnershipRequests = (overrideMediaId?: string) => {
  const { profile } = useProfile();
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // If admin with override, fetch that media's requests
      if (overrideMediaId) {
        const { data, error } = await supabase
          .from('partnership_requests')
          .select('*')
          .eq('media_id', overrideMediaId)
          .order('requested_at', { ascending: false });
        if (error) throw error;
        setRequests((data ?? []) as PartnershipRequest[]);
        return;
      }

      // If media, fetch own requests (policy ensures scope)
      const { data, error } = await supabase
        .from('partnership_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests((data ?? []) as PartnershipRequest[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (id: string, status: 'accepted' | 'rejected', response_message?: string) => {
    try {
      const { data, error } = await supabase
        .from('partnership_requests')
        .update({ status, response_message, responded_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchRequests();
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, overrideMediaId]);

  return { requests, loading, error, refetch: fetchRequests, respondToRequest };
}

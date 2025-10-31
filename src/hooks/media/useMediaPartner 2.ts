// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MediaPartner } from '@/types/media';
import { useProfile } from '../useProfile';

export const useMediaPartner = (overrideMediaId?: string) => {
  const { profile } = useProfile();
  const [partner, setPartner] = useState<MediaPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartner = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile) {
        setPartner(null);
        return;
      }

      if (overrideMediaId) {
        const { data, error } = await supabase
          .from('media_partners')
          .select('*')
          .eq('id', overrideMediaId)
          .single();
        if (error) throw error;
        setPartner(data as MediaPartner);
        return;
      }

      // Default: media partner by current user
      const { data, error } = await supabase
        .from('media_partners')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      setPartner((data ?? null) as MediaPartner | null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const upsertPartner = async (payload: Partial<MediaPartner>) => {
    try {
      if (!profile) return { error: 'Not authenticated' };
      const { data, error } = await supabase
        .from('media_partners')
        .upsert({
          id: partner?.id,
          user_id: partner?.user_id ?? profile.id,
          name: payload.name ?? partner?.name ?? 'Mon Média',
          website: payload.website ?? partner?.website ?? null,
          description: payload.description ?? partner?.description ?? null,
          logo_url: payload.logo_url ?? partner?.logo_url ?? null,
          contact_email: payload.contact_email ?? partner?.contact_email ?? profile.email,
          contact_phone: payload.contact_phone ?? partner?.contact_phone ?? null,
          category: (payload.category as any) ?? partner?.category ?? 'other',
          audience_size: payload.audience_size ?? partner?.audience_size ?? null,
          monthly_visitors: payload.monthly_visitors ?? partner?.monthly_visitors ?? null,
          status: payload.status ?? partner?.status ?? 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      setPartner(data as MediaPartner);
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchPartner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, overrideMediaId]);

  return { partner, loading, error, refetch: fetchPartner, upsertPartner };
}

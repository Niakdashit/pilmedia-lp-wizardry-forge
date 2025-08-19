import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CampaignSettings = {
  campaign_id: string;
  publication?: any;
  campaign_url?: any;
  soft_gate?: any;
  limits?: any;
  email_verification?: any;
  legal?: any;
  winners?: any;
  data_push?: any;
  advanced?: any;
  opt_in?: any;
  tags?: string[];
  updated_at?: string;
  created_at?: string;
};

const draftKey = (campaignId: string) => `campaign:settings:draft:${campaignId}`;

export const useCampaignSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDraft = useCallback((campaignId: string): Partial<CampaignSettings> | null => {
    try {
      const raw = localStorage.getItem(draftKey(campaignId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const saveDraft = useCallback((campaignId: string, settings: Partial<CampaignSettings>) => {
    try {
      localStorage.setItem(draftKey(campaignId), JSON.stringify(settings));
    } catch (e) {
      console.warn('[useCampaignSettings] Failed to save draft', e);
    }
  }, []);

  const getSettings = useCallback(async (campaignId: string): Promise<CampaignSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      // Cast responses because this table may not exist in the generated types
      const resp: any = await (supabase as any)
        .from('campaign_settings')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (resp.error) throw resp.error;

      if (!resp.data) {
        // fallback to draft
        const draft = loadDraft(campaignId);
        return draft ? ({ campaign_id: campaignId, ...draft } as CampaignSettings) : null;
      }
      return (resp.data as unknown) as CampaignSettings;
    } catch (err: any) {
      console.error('[useCampaignSettings.getSettings] Error', err);
      setError(err.message || 'Erreur lors du chargement des paramètres');
      // also try draft
      const draft = loadDraft(campaignId);
      return draft ? ({ campaign_id: campaignId, ...draft } as CampaignSettings) : null;
    } finally {
      setLoading(false);
    }
  }, [loadDraft]);

  const upsertSettings = useCallback(async (campaignId: string, values: Partial<CampaignSettings>): Promise<CampaignSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const payload: any = {
        campaign_id: campaignId,
        publication: values.publication ?? null,
        campaign_url: values.campaign_url ?? null,
        soft_gate: values.soft_gate ?? null,
        limits: values.limits ?? null,
        email_verification: values.email_verification ?? null,
        legal: values.legal ?? null,
        winners: values.winners ?? null,
        data_push: values.data_push ?? null,
        advanced: values.advanced ?? null,
        opt_in: values.opt_in ?? null,
        tags: values.tags ?? null,
        updated_at: new Date().toISOString(),
      };

      // Try update first (cast because table may not exist in generated types)
      const existingResp: any = await (supabase as any)
        .from('campaign_settings')
        .select('campaign_id')
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (existingResp.error) throw existingResp.error;

      let result: any = null;
      if (existingResp.data) {
        const updateResp: any = await (supabase as any)
          .from('campaign_settings')
          .update(payload)
          .eq('campaign_id', campaignId)
          .select()
          .single();
        if (updateResp.error) throw updateResp.error;
        result = updateResp.data;
      } else {
        const insertResp: any = await (supabase as any)
          .from('campaign_settings')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();
        if (insertResp.error) throw insertResp.error;
        result = insertResp.data;
      }

      // clear draft on success
      try { localStorage.removeItem(draftKey(campaignId)); } catch {}
      return result as CampaignSettings;
    } catch (err: any) {
      console.error('[useCampaignSettings.upsertSettings] Error', err);
      setError(err.message || 'Erreur lors de la sauvegarde des paramètres');
      // Save a draft for fallback
      saveDraft(campaignId, values);
      return null;
    } finally {
      setLoading(false);
    }
  }, [saveDraft]);

  return {
    getSettings,
    upsertSettings,
    saveDraft,
    loadDraft,
    loading,
    error,
  };
};

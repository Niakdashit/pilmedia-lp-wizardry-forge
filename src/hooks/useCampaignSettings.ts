import { useCallback, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
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
  output?: any;
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
  const setCampaign = useEditorStore((s) => s.setCampaign);

  // Helper: detect UUID v4 format
  const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

  // Resolve a campaign id or slug to the actual UUID id stored in DB
  const resolveCampaignId = useCallback(async (idOrSlug: string): Promise<string | null> => {
    try {
      // 1) Direct UUID
      if (idOrSlug && isUuid(idOrSlug)) return idOrSlug;

      // 2) If missing or not a UUID yet, try URL parameter (?campaign=...)
      if (typeof window !== 'undefined') {
        try {
          const urlId = new URLSearchParams(window.location.search).get('campaign') || '';
          if (urlId && isUuid(urlId)) {
            // eslint-disable-next-line no-console
            console.log('[useCampaignSettings] Resolved campaignId from URL param:', urlId);
            return urlId;
          }
        } catch {}
      }

      // 3) Lookup by slug when a non-UUID value is provided
      if (!idOrSlug) return null;
      if (isUuid(idOrSlug)) return idOrSlug;
      // Lookup by slug
      const { data, error } = await supabase
        .from('campaigns')
        .select('id')
        .eq('slug', idOrSlug)
        .maybeSingle();
      if (error) throw error;
      return (data?.id as string) ?? null;
    } catch (e) {
      return null;
    }
  }, []);

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
      // Ensure we operate on a real UUID
      const realId = await resolveCampaignId(campaignId);
      const keyId = realId || campaignId; // keep original for draft key in case

      // If we do not have a valid UUID yet (new campaign via slug or empty),
      // do NOT hit DB with an invalid uuid placeholder. Just return draft.
      if (!realId) {
        const draft = loadDraft(keyId);
        return draft ? ({ campaign_id: keyId, ...draft } as CampaignSettings) : null;
      }

      // Cast responses because this table may not exist in the generated types
      const resp: any = await (supabase as any)
        .from('campaign_settings')
        .select('*')
        .eq('campaign_id', realId)
        .maybeSingle();

      if (resp.error) throw resp.error;

      if (!resp.data) {
        // fallback to draft
        const draft = loadDraft(keyId);
        return draft ? ({ campaign_id: keyId, ...draft } as CampaignSettings) : null;
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
  }, [loadDraft, resolveCampaignId]);

  const upsertSettings = useCallback(async (campaignId: string, values: Partial<CampaignSettings>): Promise<CampaignSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const realId = await resolveCampaignId(campaignId);
      if (!user || !realId) {
        // Early state (unauthenticated or unresolved id): keep a local draft and exit quietly
        try { saveDraft(campaignId, values); } catch {}
        console.warn('[useCampaignSettings.upsertSettings] Skipped (unauthenticated or unresolved id)', { hasUser: !!user, campaignId, realId });
        return null;
      }

      const payload: any = {
        campaign_id: realId,
        publication: values.publication ?? null,
        campaign_url: values.campaign_url ?? null,
        soft_gate: values.soft_gate ?? null,
        limits: values.limits ?? null,
        email_verification: values.email_verification ?? null,
        legal: values.legal ?? null,
        winners: values.winners ?? null,
        output: values.output ?? null,
        data_push: values.data_push ?? null,
        advanced: values.advanced ?? null,
        opt_in: values.opt_in ?? null,
        tags: values.tags ?? null,
        updated_at: new Date().toISOString(),
      };

      // Ensure the campaign row exists and is owned by current user to satisfy RLS on campaign_settings
      try {
        const checkResp: any = await (supabase as any)
          .from('campaigns')
          .select('id, created_by')
          .eq('id', realId)
          .maybeSingle();

        const exists = !!checkResp?.data?.id;
        const ownerId = checkResp?.data?.created_by as string | undefined;
        if (!exists) {
          // eslint-disable-next-line no-console
          console.log('[useCampaignSettings] Campaign not found, creating minimal row before settings upsert');
          const slugSuffix = Math.random().toString(36).slice(2, 10);
          const insertCampaignResp: any = await (supabase as any)
            .from('campaigns')
            .insert({
              id: realId,
              name: (values?.publication as any)?.name || 'Campaign',
              slug: `camp-${slugSuffix}`,
              type: 'wheel',
              status: 'draft',
              created_by: user.id,
              updated_at: new Date().toISOString(),
            })
            .select('id')
            .single();
          if (insertCampaignResp.error) throw insertCampaignResp.error;
        } else if (ownerId && ownerId !== user.id) {
          // Do not attempt to takeover ownership automatically; let RLS fail later with clear error
          // eslint-disable-next-line no-console
          console.warn('[useCampaignSettings] Campaign exists but is owned by another user; settings upsert may be blocked by RLS');
        }
      } catch (e) {
        // Non-blocking: if this fails (due to RLS or other), we let the normal flow continue; upsert may still succeed if allowed
        console.warn('[useCampaignSettings] ensure-campaign-exists step skipped', e);
      }

      // Try update first (cast because table may not exist in generated types)
      const existingResp: any = await (supabase as any)
        .from('campaign_settings')
        .select('campaign_id')
        .eq('campaign_id', realId)
        .maybeSingle();

      if (existingResp.error) throw existingResp.error;

      let result: any = null;
      if (existingResp.data) {
        const updateResp: any = await (supabase as any)
          .from('campaign_settings')
          .update(payload)
          .eq('campaign_id', realId)
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

      // Sync basic fields to campaigns for listing/search (best-effort)
      try {
        const pub: any = values.publication || {};
        const name = pub.name as (string | undefined);
        const startIso = pub.start as (string | undefined);
        const endIso = pub.end as (string | undefined);
        const updatePayload: any = { updated_at: new Date().toISOString() };
        if (name && typeof name === 'string' && name.trim().length > 0) {
          updatePayload.name = name.trim();
        }
        if (startIso) updatePayload.start_date = startIso;
        if (endIso) updatePayload.end_date = endIso;
        if (Object.keys(updatePayload).length > 1) {
          await supabase.from('campaigns').update(updatePayload).eq('id', realId);
        }
      } catch (e) {
        // non bloquant
        console.warn('[useCampaignSettings] campaigns sync skipped', e);
      }

      // Also update the local editor store so validation passes immediately
      try {
        const pub: any = values.publication || {};
        const name = (pub.name as string) || undefined;
        const split = (iso?: string) => {
          if (!iso || typeof iso !== 'string') return { date: undefined as string | undefined, time: undefined as string | undefined };
          const [d, tWithZone] = iso.split('T');
          const t = (tWithZone || '').replace('Z', '').slice(0, 5) || undefined;
          return { date: d || undefined, time: t };
        };
        const s = split(pub.start);
        const e = split(pub.end);
        setCampaign((prev) => !prev ? prev : ({
          ...prev,
          name: name || prev.name || 'Campaign',
          campaign_settings: {
            ...(prev as any).campaign_settings,
            start_date: s.date,
            start_time: s.time,
            end_date: e.date,
            end_time: e.time,
          }
        } as any));
      } catch (e) {
        console.warn('[useCampaignSettings] local store sync skipped', e);
      }

      return result as CampaignSettings;
    } catch (err: any) {
      console.error('[useCampaignSettings.upsertSettings] Error', err?.message || err);
      setError(err.message || 'Erreur lors de la sauvegarde des paramètres');
      // Save a draft for fallback
      saveDraft(campaignId, values);
      return null;
    } finally {
      setLoading(false);
    }
  }, [saveDraft, resolveCampaignId]);

  return {
    getSettings,
    upsertSettings,
    saveDraft,
    loadDraft,
    loading,
    error,
  };
};

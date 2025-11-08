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
  const selectCampaign = useEditorStore((s) => s.selectCampaign);

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

  // Normalize campaign_url value to a safe shape for the app/UI
  const normalizeCampaignUrl = useCallback((cu: any): any => {
    try {
      if (!cu) return null;
      if (typeof cu === 'string') {
        // Try to parse JSON string; fallback to plain URL string
        try {
          const parsed = JSON.parse(cu);
          if (parsed && typeof parsed === 'object') {
            const url = typeof parsed.url === 'string' ? parsed.url : undefined;
            const custom_url = typeof parsed.custom_url === 'string' ? parsed.custom_url : undefined;
            return url || custom_url ? { url, custom_url } : null;
          }
        } catch {}
        return { url: cu };
      }
      if (typeof cu === 'object') {
        // If a string was previously spread ("{0:'h',1:'t',...}"), ignore numeric keys
        const url = typeof (cu as any).url === 'string' ? (cu as any).url : undefined;
        const custom_url = typeof (cu as any).custom_url === 'string' ? (cu as any).custom_url : undefined;
        return url || custom_url ? { url, custom_url } : null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const loadDraft = useCallback((campaignId: string): Partial<CampaignSettings> | null => {
    try {
      const raw = localStorage.getItem(draftKey(campaignId));
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof (parsed as any).campaign_url !== 'undefined') {
        (parsed as any).campaign_url = normalizeCampaignUrl((parsed as any).campaign_url);
      }
      return parsed;
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
      const data: any = resp.data;
      data.campaign_url = normalizeCampaignUrl(data.campaign_url);
      return (data as unknown) as CampaignSettings;
    } catch (err: any) {
      console.error('[useCampaignSettings.getSettings] Error', err);
      setError(err.message || 'Erreur lors du chargement des paramètres');
      // also try draft
      const draft = loadDraft(campaignId);
      const normalizedDraft = draft ? { ...draft, campaign_url: normalizeCampaignUrl((draft as any).campaign_url) } : null;
      return normalizedDraft ? ({ campaign_id: campaignId, ...normalizedDraft } as CampaignSettings) : null;
    } finally {
      setLoading(false);
    }
  }, [loadDraft, resolveCampaignId]);

  const upsertSettings = useCallback(async (campaignId: string, values: Partial<CampaignSettings>): Promise<CampaignSettings | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Unauthenticated: keep a local draft and exit
        try { saveDraft(campaignId, values); } catch {}
        console.warn('[useCampaignSettings.upsertSettings] Skipped (unauthenticated)', { campaignId });
        return null;
      }
      
      let realId = await resolveCampaignId(campaignId);
      
      // If we can't resolve the ID, try to create the campaign first
      if (!realId) {
        console.log('[useCampaignSettings] Campaign ID not found, creating campaign first');
        const slugSuffix = Math.random().toString(36).slice(2, 10);
        const campaignName = (values?.publication as any)?.name || 'Campaign';
        const currentType = (useEditorStore.getState().campaign as any)?.type || 'wheel';
        
        const insertCampaignResp: any = await (supabase as any)
          .from('campaigns')
          .insert({
            name: campaignName,
            slug: `camp-${slugSuffix}`,
            type: currentType, // Respect current editor type
            status: 'draft',
            created_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();
          
        if (insertCampaignResp.error) {
          console.error('[useCampaignSettings] Failed to create campaign:', insertCampaignResp.error);
          throw insertCampaignResp.error;
        }
        
        realId = insertCampaignResp.data.id;
        console.log('[useCampaignSettings] Created new campaign with ID:', realId);
      }
      
      // Final check: if realId is still null, throw error
      if (!realId) {
        throw new Error('Unable to resolve or create campaign ID');
      }

      // Normalize and coerce campaign_url to a safe value for DB
      const normalizedUrlObj = normalizeCampaignUrl(values.campaign_url);
      const campaignUrlValue: string | null = (() => {
        if (!normalizedUrlObj) return null;
        // Prefer storing the main URL as a string to be compatible with TEXT or JSONB columns
        return typeof (normalizedUrlObj as any).url === 'string' ? (normalizedUrlObj as any).url : (typeof normalizedUrlObj === 'string' ? normalizedUrlObj : null);
      })();

      const payload: any = {
        campaign_id: realId,
        publication: values.publication ?? null,
        campaign_url: campaignUrlValue, // store as string for maximum compatibility
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

      // Derive dedicated date/time columns from publication.start/end when provided
      try {
        const pub: any = values.publication || {};
        const split = (iso?: string) => {
          if (!iso || typeof iso !== 'string') return { date: null as string | null, time: null as string | null };
          const [d, tWithZone] = iso.split('T');
          const t = (tWithZone || '').replace('Z', '').slice(0, 5) || null;
          return { date: d || null, time: t };
        };
        const s = split(pub.start);
        const e = split(pub.end);
        if (s.date) (payload as any).start_date = s.date;
        if (s.time) (payload as any).start_time = s.time;
        if (e.date) (payload as any).end_date = e.date;
        if (e.time) (payload as any).end_time = e.time;
      } catch {}


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
          const currentType = (useEditorStore.getState().campaign as any)?.type || 'wheel';
          const insertCampaignResp: any = await (supabase as any)
            .from('campaigns')
            .insert({
              id: realId,
              name: (values?.publication as any)?.name || 'Campaign',
              slug: `camp-${slugSuffix}`,
              type: currentType,
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

      // Ensure editor store and URL reflect the real campaign id
      try {
        setCampaign((prev) => prev ? ({ ...prev, id: realId as string }) : prev);
        selectCampaign(realId as string);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          // Preserve existing mode parameter (article/fullscreen)
          const currentMode = url.searchParams.get('mode');
          url.searchParams.set('campaign', realId as string);
          if (currentMode) {
            url.searchParams.set('mode', currentMode);
          }
          window.history.replaceState({}, '', url.toString());
        }
      } catch (e) {
        console.warn('[useCampaignSettings] id sync skipped', e);
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

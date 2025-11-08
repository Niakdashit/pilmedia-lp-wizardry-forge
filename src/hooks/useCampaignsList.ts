import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface CampaignListItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: 'draft' | 'active' | 'scheduled' | 'ended' | 'paused';
  created_at: string;
  created_by: string | null;
  banner_url: string | null;
  participants: number;
  startDate: string;
  endDate: string;
  editor_mode?: 'article' | 'fullscreen' | null;
}

const CAMPAIGN_LIST_CACHE_TTL_MS = 30_000; // 30s is enough for dashboard refocus
const CAMPAIGN_LIST_CACHE_KEY = 'campaign:list:default';
type CampaignListCacheEntry = { data: CampaignListItem[]; expiresAt: number };
const campaignListCache = new Map<string, CampaignListCacheEntry>();

const getNow = () => Date.now();

const readLocalListCache = (key: string): CampaignListItem[] | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CampaignListCacheEntry;
    if (!parsed || typeof parsed.expiresAt !== 'number') return null;
    if (parsed.expiresAt < getNow()) return null;
    return Array.isArray(parsed.data) ? (parsed.data as CampaignListItem[]) : null;
  } catch {
    return null;
  }
};

const writeLocalListCache = (key: string, data: CampaignListItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    const entry: CampaignListCacheEntry = { data, expiresAt: getNow() + CAMPAIGN_LIST_CACHE_TTL_MS };
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // best-effort only
  }
};

export const useCampaignsList = () => {
  const { profile } = useProfile();
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrateFromCache = () => {
    const mem = campaignListCache.get(CAMPAIGN_LIST_CACHE_KEY);
    if (mem && mem.expiresAt > getNow()) {
      // Recompute names from local drafts to reflect unsaved settings changes
      const recomputed = (mem.data || []).map((c) => {
        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem(`campaign:settings:draft:${c.id}`) : null;
          if (!raw) return c;
          const draft = JSON.parse(raw);
          const draftName = draft?.publication?.name as (string | undefined);
          if (draftName && draftName.trim()) {
            return { ...c, name: draftName.trim() };
          }
        } catch {}
        return c;
      });
      setCampaigns(recomputed);
      return true;
    }
    const local = readLocalListCache(CAMPAIGN_LIST_CACHE_KEY);
    if (local) {
      // Recompute names from local drafts
      const recomputed = (local || []).map((c) => {
        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem(`campaign:settings:draft:${c.id}`) : null;
          if (!raw) return c;
          const draft = JSON.parse(raw);
          const draftName = draft?.publication?.name as (string | undefined);
          if (draftName && draftName.trim()) {
            return { ...c, name: draftName.trim() };
          }
        } catch {}
        return c;
      });
      campaignListCache.set(CAMPAIGN_LIST_CACHE_KEY, {
        data: recomputed,
        expiresAt: getNow() + CAMPAIGN_LIST_CACHE_TTL_MS,
      });
      setCampaigns(recomputed);
      return true;
    }
    return false;
  };

  const fetchCampaigns = async (options: { suppressLoading?: boolean } = {}) => {
    const { suppressLoading = false } = options;
    try {
      if (!suppressLoading) {
        setLoading(true);
      }
      setError(null);

      // For admin: see all campaigns
      // For media: only see campaigns shared with them
      // For regular users: only see their own campaigns
      let query = supabase
        .from('campaigns')
        .select(`
          id,
          name,
          description,
          type,
          status,
          created_at,
          created_by,
          banner_url,
          start_date,
          end_date,
          editor_mode,
          config,
          campaign_stats (
            participations,
            views
          ),
          campaign_settings (
            publication,
            start_date,
            end_date,
            start_time,
            end_time
          )
        `)
        .order('created_at', { ascending: false });

      // If not admin, filter by created_by
      if (!profile?.is_admin && profile?.id) {
        query = query.eq('created_by', profile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match our interface
      const transformedCampaigns: CampaignListItem[] = (data || []).map((campaign: any) => {
        // Extract dates with STRICT priority: DB columns first (synchronized by trigger)
        let startDate = '';
        let endDate = '';
        
        // Prefer publication.name from campaign_settings for display name
        const publicationName = campaign.campaign_settings?.[0]?.publication?.name;
        
        // PRIORITY 1: campaigns table columns (now always up-to-date via trigger)
        if (campaign.start_date) {
          try { startDate = new Date(campaign.start_date).toISOString(); } catch { startDate = campaign.start_date; }
        }
        if (campaign.end_date) {
          try { endDate = new Date(campaign.end_date).toISOString(); } catch { endDate = campaign.end_date; }
        }
        
        // PRIORITY 2: campaign_settings (fallback if DB columns empty - shouldn't happen after trigger)
        if (!startDate || !endDate) {
          const cs: any = campaign.campaign_settings;
          const csRow = Array.isArray(cs) ? cs[0] : cs;
          if (csRow) {
            if (!startDate && csRow.start_date) {
              const d = String(csRow.start_date);
              const t = typeof csRow.start_time === 'string' ? csRow.start_time : undefined;
              startDate = d.includes('T') ? d : new Date(`${d}T${t || '00:00'}`).toISOString();
            }
            if (!endDate && csRow.end_date) {
              const d = String(csRow.end_date);
              const t = typeof csRow.end_time === 'string' ? csRow.end_time : undefined;
              endDate = d.includes('T') ? d : new Date(`${d}T${t || '23:59'}`).toISOString();
            }
            // Publication ISO (last resort)
            if (!startDate && csRow.publication?.start) {
              try { startDate = new Date(csRow.publication.start).toISOString(); } catch {}
            }
            if (!endDate && csRow.publication?.end) {
              try { endDate = new Date(csRow.publication.end).toISOString(); } catch {}
            }
          }
        }
        
        // PRIORITY 3: config (legacy - should rarely be used now)
        if ((!startDate || !endDate) && campaign.config) {
          try {
            const config = typeof campaign.config === 'string' ? JSON.parse(campaign.config) : campaign.config;
            if (config.startDate && !startDate) {
              const time = config.startTime || '00:00';
              startDate = new Date(`${config.startDate}T${time}`).toISOString();
            }
            if (config.endDate && !endDate) {
              const time = config.endTime || '23:59';
              endDate = new Date(`${config.endDate}T${time}`).toISOString();
            }
            // Legacy single ISO
            if (!startDate && config.startDate) startDate = config.startDate;
            if (!endDate && config.endDate) endDate = config.endDate;
          } catch {}
        }

        // Fallback: keep empty when not configured
        let draftName: string | undefined;
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem(`campaign:settings:draft:${campaign.id}`) : null;
          if (raw) {
            const draft = JSON.parse(raw);
            draftName = draft?.publication?.name || undefined;
          }
        } catch {}

        return {
          id: campaign.id,
          name: publicationName || draftName || campaign.name,
          description: campaign.description,
          type: campaign.type,
          status: campaign.status,
          editor_mode: campaign.editor_mode ?? null,
          created_at: campaign.created_at,
          created_by: campaign.created_by,
          banner_url: campaign.banner_url,
          participants: campaign.campaign_stats?.[0]?.participations || 0,
          startDate,
          endDate,
        };
      });

      setCampaigns(transformedCampaigns);
      campaignListCache.set(CAMPAIGN_LIST_CACHE_KEY, {
        data: transformedCampaigns,
        expiresAt: getNow() + CAMPAIGN_LIST_CACHE_TTL_MS,
      });
      writeLocalListCache(CAMPAIGN_LIST_CACHE_KEY, transformedCampaigns);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: CampaignListItem['status']) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;
      await fetchCampaigns(); // Refresh data
    } catch (e) {
      throw e instanceof Error ? e : new Error('Unknown error');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      // Optimistic UI
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));

      // Cascade deletes for known dependent tables
      await supabase.from('participations').delete().eq('campaign_id', campaignId);
      await supabase.from('campaign_stats').delete().eq('campaign_id', campaignId);

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      await fetchCampaigns(); // Ensure fresh state from DB
      return true;
    } catch (e: any) {
      console.error('[useCampaignsList] deleteCampaign failed', e);
      // Rollback UI if failed
      await fetchCampaigns();
      throw e instanceof Error ? e : new Error('Unknown error');
    }
  };

  useEffect(() => {
    if (profile?.id) {
      const hadCache = hydrateFromCache();
      fetchCampaigns({ suppressLoading: hadCache });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const invalidateCache = () => {
    try { campaignListCache.delete(CAMPAIGN_LIST_CACHE_KEY); } catch {}
    try { if (typeof window !== 'undefined') localStorage.removeItem(CAMPAIGN_LIST_CACHE_KEY); } catch {}
  };

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    updateCampaignStatus,
    deleteCampaign,
    invalidateCache,
  };
};

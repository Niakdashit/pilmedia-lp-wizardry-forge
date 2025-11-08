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
            end_date
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
        // Extract dates from campaign_settings (preferred) or fallback to campaign columns
        let startDate = '';
        let endDate = '';
        // Prefer publication.name from campaign_settings for display name
        const publicationName = campaign.campaign_settings?.[0]?.publication?.name;
        // Fallback: read local draft (unsaved settings) to keep list name consistent with settings UI
        let draftName: string | undefined;
        try {
          const draftKey = `campaign:settings:draft:${campaign.id}`;
          const raw = localStorage.getItem(draftKey);
          if (raw) {
            const draft = JSON.parse(raw);
            draftName = draft?.publication?.name || undefined;
          }
        } catch {}
        
        // Priority 1: campaign_settings table
        if (campaign.campaign_settings?.[0]?.start_date) {
          startDate = campaign.campaign_settings[0].start_date;
        }
        if (campaign.campaign_settings?.[0]?.end_date) {
          endDate = campaign.campaign_settings[0].end_date;
        }
        
        // Priority 2: Extract dates and times from config if stored in those fields (ModernGeneralTab)
        if ((!startDate || !endDate) && campaign.config) {
          try {
            const config = typeof campaign.config === 'string' ? JSON.parse(campaign.config) : campaign.config;
            
            // If we have separate date/time fields, combine them
            if (config.startDate && !startDate) {
              const time = config.startTime || '00:00';
              startDate = new Date(`${config.startDate}T${time}`).toISOString();
            }
            if (config.endDate && !endDate) {
              const time = config.endTime || '23:59';
              endDate = new Date(`${config.endDate}T${time}`).toISOString();
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        // Priority 3 (legacy single ISO in config): config.startDate/endDate
        if ((!startDate || !endDate) && campaign.config) {
          try {
            const config = typeof campaign.config === 'string' ? JSON.parse(campaign.config) : campaign.config;
            if (!startDate && config.startDate) startDate = config.startDate;
            if (!endDate && config.endDate) endDate = config.endDate;
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        // Priority 4: campaign.start_date / end_date columns (DB top-level)
        if (!startDate && campaign.start_date) startDate = campaign.start_date;
        if (!endDate && campaign.end_date) endDate = campaign.end_date;

        // Get participants count
        const participants = campaign.campaign_stats?.[0]?.participations || 0;

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
          participants,
          // Fallback to created_at if dates are missing (ensures all campaigns have displayable dates)
          startDate: startDate || campaign.created_at,
          endDate: endDate || new Date(new Date(campaign.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
    updateCampaignStatus,
    deleteCampaign,
  };
};

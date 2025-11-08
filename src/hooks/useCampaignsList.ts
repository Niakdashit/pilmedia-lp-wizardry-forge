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
  config?: any;
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
        // Compute dates preferring campaign_settings (source of truth)
        let startDate = '';
        let endDate = '';
        
        // Prefer publication.name from campaign_settings for display name
        const publicationName = campaign.campaign_settings?.[0]?.publication?.name;
        
        // Read from campaigns table (may be stale if trigger didn't sync)
        if (campaign.start_date) {
          try { startDate = new Date(campaign.start_date).toISOString(); } catch { startDate = String(campaign.start_date); }
        }
        if (campaign.end_date) {
          try { endDate = new Date(campaign.end_date).toISOString(); } catch { endDate = String(campaign.end_date); }
        }
        
        // Always compute dates from campaign_settings and override when available
        const cs: any = campaign.campaign_settings;
        const csRow = Array.isArray(cs) ? cs[0] : cs;
        if (csRow) {
          // start from start_date + optional start_time
          let csStart = '';
          if (csRow.start_date) {
            const d = String(csRow.start_date);
            const t = typeof csRow.start_time === 'string' ? csRow.start_time : '00:00';
            csStart = d.includes('T') ? d : `${d}T${t}`;
          } else if (csRow.publication?.start) {
            csStart = String(csRow.publication.start);
          }
          if (csStart) {
            try { startDate = new Date(csStart).toISOString(); } catch { startDate = csStart; }
          }
          
          // end from end_date + optional end_time
          let csEnd = '';
          if (csRow.end_date) {
            const d = String(csRow.end_date);
            const t = typeof csRow.end_time === 'string' ? csRow.end_time : '23:59';
            csEnd = d.includes('T') ? d : `${d}T${t}`;
          } else if (csRow.publication?.end) {
            csEnd = String(csRow.publication.end);
          }
          if (csEnd) {
            try { endDate = new Date(csEnd).toISOString(); } catch { endDate = csEnd; }
          }
        }
        
        // Legacy fallback from config
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
        
        // Debug log for jackpot fs
        if (campaign.name === 'jackpot fs') {
          const csDbg: any = campaign.campaign_settings;
          const csDbgRow = Array.isArray(csDbg) ? csDbg[0] : csDbg;
          console.log('🔍 [useCampaignsList] Loading jackpot fs dates:', {
            name: campaign.name,
            'campaign.start_date': campaign.start_date,
            'campaign.end_date': campaign.end_date,
            'csRow?.start_date': csDbgRow?.start_date,
            'csRow?.end_date': csDbgRow?.end_date,
            'csRow?.publication?.start': csDbgRow?.publication?.start,
            'csRow?.publication?.end': csDbgRow?.publication?.end,
            'final startDate': startDate,
            'final endDate': endDate,
          });
        }
        
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
          config: campaign.config,
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

  // Auto-refresh when page becomes visible (after SQL migrations, settings changes, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && profile?.id) {
        console.log('🔄 [useCampaignsList] Page visible - invalidating cache and refetching');
        invalidateCache();
        fetchCampaigns({ suppressLoading: true });
      }
    };
    
    // Also listen to focus event for immediate refresh when returning to tab
    const handleFocus = () => {
      if (profile?.id) {
        console.log('🔄 [useCampaignsList] Window focused - invalidating cache and refetching');
        invalidateCache();
        fetchCampaigns({ suppressLoading: true });
      }
    };
    
    // CRITICAL: Listen for campaign settings saved event and force immediate refresh
    const handleSettingsSaved = () => {
      if (profile?.id) {
        console.log('💾 [useCampaignsList] Campaign settings saved - forcing immediate refresh');
        invalidateCache();
        // Wait 500ms to let database sync complete, then refetch
        setTimeout(() => {
          console.log('🔄 [useCampaignsList] Refetching campaigns after settings save...');
          fetchCampaigns({ suppressLoading: false });
        }, 500);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('campaign:settings:saved', handleSettingsSaved as EventListener);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('campaign:settings:saved', handleSettingsSaved as EventListener);
    };
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

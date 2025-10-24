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
}

export const useCampaignsList = () => {
  const { profile } = useProfile();
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // For admin: see all campaigns
      // For media: only see campaigns shared with them
      // For regular users: only see their own campaigns
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          campaign_stats (
            participations,
            views
          ),
          campaign_settings (
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
        
        // Priority 1: campaign_settings table
        if (campaign.campaign_settings?.[0]?.start_date) {
          startDate = campaign.campaign_settings[0].start_date;
        }
        if (campaign.campaign_settings?.[0]?.end_date) {
          endDate = campaign.campaign_settings[0].end_date;
        }
        
        // Priority 2: campaign.start_date / end_date columns
        if (!startDate && campaign.start_date) startDate = campaign.start_date;
        if (!endDate && campaign.end_date) endDate = campaign.end_date;
        
        // Priority 3 (legacy): config.startDate/endDate
        if (!startDate || !endDate) {
          if (campaign.config) {
            try {
              const config = typeof campaign.config === 'string' ? JSON.parse(campaign.config) : campaign.config;
              if (!startDate && config.startDate) startDate = config.startDate;
              if (!endDate && config.endDate) endDate = config.endDate;
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }

        // Get participants count
        const participants = campaign.campaign_stats?.[0]?.participations || 0;

        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          type: campaign.type,
          status: campaign.status,
          created_at: campaign.created_at,
          created_by: campaign.created_by,
          banner_url: campaign.banner_url,
          participants,
          startDate: startDate || campaign.created_at,
          endDate: endDate || campaign.created_at,
        };
      });

      setCampaigns(transformedCampaigns);
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
      fetchCampaigns();
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

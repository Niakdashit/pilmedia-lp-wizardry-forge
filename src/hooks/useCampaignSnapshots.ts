import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CampaignSnapshot {
  id: string;
  campaign_id: string;
  revision: number;
  config?: any;
  design?: any;
  game_config?: any;
  article_config?: any;
  form_fields?: any;
  created_at: string;
  created_by?: string;
  description?: string;
  snapshot_type: 'auto' | 'manual' | 'publish';
  payload_size_bytes?: number;
}

export const useCampaignSnapshots = () => {
  const [snapshots, setSnapshots] = useState<CampaignSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all snapshots for a campaign
   */
  const fetchSnapshots = useCallback(async (campaignId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_snapshots' as any)
        .select('*')
        .eq('campaign_id', campaignId)
        .order('revision', { ascending: false });

      if (error) throw error;
      setSnapshots(data as any || []);
      return data as any || [];
    } catch (error) {
      console.error('[useCampaignSnapshots] Fetch error:', error);
      toast.error('Erreur lors du chargement des snapshots');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a manual snapshot
   */
  const createSnapshot = useCallback(async (
    campaignId: string,
    description?: string
  ) => {
    try {
      // First get current campaign data
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchError) throw fetchError;

      const campaignData = campaign as any;

      // Create snapshot
      const { data: snapshot, error } = await supabase
        .from('campaign_snapshots' as any)
        .insert({
          campaign_id: campaignId,
          revision: campaignData.revision || 1,
          config: campaignData.config,
          design: campaignData.design,
          game_config: campaignData.game_config,
          article_config: campaignData.article_config,
          form_fields: campaignData.form_fields,
          snapshot_type: 'manual',
          description: description || `Snapshot manuel (rev ${campaignData.revision || 1})`,
          payload_size_bytes: JSON.stringify({
            config: campaignData.config,
            design: campaignData.design,
            game_config: campaignData.game_config,
            article_config: campaignData.article_config,
            form_fields: campaignData.form_fields,
          }).length,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Snapshot créé avec succès');
      return snapshot;
    } catch (error) {
      console.error('[useCampaignSnapshots] Create error:', error);
      toast.error('Erreur lors de la création du snapshot');
      return null;
    }
  }, []);

  /**
   * Restore a campaign from a snapshot
   */
  const restoreSnapshot = useCallback(async (
    campaignId: string,
    snapshotId: string
  ) => {
    try {
      // Get snapshot data
      const { data: snapshot, error: fetchError } = await supabase
        .from('campaign_snapshots' as any)
        .select('*')
        .eq('id', snapshotId)
        .single();

      if (fetchError) throw fetchError;

      const snapshotData = snapshot as any;

      // Update campaign with snapshot data
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          config: snapshotData.config,
          design: snapshotData.design,
          game_config: snapshotData.game_config,
          article_config: snapshotData.article_config,
          form_fields: snapshotData.form_fields,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', campaignId);

      if (updateError) throw updateError;

      toast.success(`Campagne restaurée à la révision ${snapshotData.revision || '?'}`);
      return true;
    } catch (error) {
      console.error('[useCampaignSnapshots] Restore error:', error);
      toast.error('Erreur lors de la restauration');
      return false;
    }
  }, []);

  /**
   * Delete a snapshot
   */
  const deleteSnapshot = useCallback(async (snapshotId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_snapshots' as any)
        .delete()
        .eq('id', snapshotId);

      if (error) throw error;

      setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      toast.success('Snapshot supprimé');
      return true;
    } catch (error) {
      console.error('[useCampaignSnapshots] Delete error:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  return {
    snapshots,
    isLoading,
    fetchSnapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
  };
};

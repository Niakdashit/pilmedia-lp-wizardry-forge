import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CampaignBackup {
  id: string;
  campaign_id: string;
  backup_name: string;
  description: string | null;
  full_snapshot: any;
  metadata: any;
  created_at: string;
  created_by: string | null;
}

export const useCampaignBackups = () => {
  const [backups, setBackups] = useState<CampaignBackup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all backups for a campaign
   */
  const fetchBackups = useCallback(async (campaignId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_backups')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
      return data || [];
    } catch (error) {
      console.error('[useCampaignBackups] Fetch error:', error);
      toast.error('Erreur lors du chargement des sauvegardes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new backup
   */
  const createBackup = useCallback(async (
    campaignId: string,
    backupName: string,
    description?: string
  ) => {
    try {
      // Get current campaign data
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchError) throw fetchError;

      // Create backup with full campaign snapshot
      const { data: backup, error } = await supabase
        .from('campaign_backups')
        .insert({
          campaign_id: campaignId,
          backup_name: backupName,
          description: description,
          full_snapshot: campaign,
          metadata: {
            revision: campaign.revision,
            type: campaign.type,
            status: campaign.status,
          },
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Sauvegarde "${backupName}" créée`);
      return backup;
    } catch (error: any) {
      console.error('[useCampaignBackups] Create error:', error);
      if (error?.code === '23505') {
        toast.error('Une sauvegarde avec ce nom existe déjà');
      } else {
        toast.error('Erreur lors de la création de la sauvegarde');
      }
      return null;
    }
  }, []);

  /**
   * Restore a campaign from a backup
   */
  const restoreBackup = useCallback(async (
    campaignId: string,
    backupId: string
  ) => {
    try {
      // Get backup data
      const { data: backup, error: fetchError } = await supabase
        .from('campaign_backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (fetchError) throw fetchError;

      const snapshot = backup.full_snapshot as any;
      if (!snapshot) throw new Error('Snapshot invalide');

      // Update campaign with backup data
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          name: snapshot.name,
          description: snapshot.description,
          type: snapshot.type,
          config: snapshot.config,
          design: snapshot.design,
          game_config: snapshot.game_config,
          article_config: snapshot.article_config,
          form_fields: snapshot.form_fields,
          editor_mode: snapshot.editor_mode,
          thumbnail_url: snapshot.thumbnail_url,
          banner_url: snapshot.banner_url,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', campaignId);

      if (updateError) throw updateError;

      toast.success(`Campagne restaurée depuis "${backup.backup_name}"`);
      return true;
    } catch (error) {
      console.error('[useCampaignBackups] Restore error:', error);
      toast.error('Erreur lors de la restauration');
      return false;
    }
  }, []);

  /**
   * Delete a backup
   */
  const deleteBackup = useCallback(async (backupId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_backups')
        .delete()
        .eq('id', backupId);

      if (error) throw error;

      setBackups(prev => prev.filter(b => b.id !== backupId));
      toast.success('Sauvegarde supprimée');
      return true;
    } catch (error) {
      console.error('[useCampaignBackups] Delete error:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  return {
    backups,
    isLoading,
    fetchBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
  };
};

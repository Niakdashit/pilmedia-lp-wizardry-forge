import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SaveAndExitOptions {
  campaignId: string;
  campaignData: any;
  onBeforeSave?: () => void;
  redirectPath?: string;
}

export const useSaveAndExit = () => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const saveAndExit = useCallback(async ({
    campaignId,
    campaignData,
    onBeforeSave,
    redirectPath = '/sauvegardes'
  }: SaveAndExitOptions) => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Call pre-save hook if provided
      if (onBeforeSave) {
        onBeforeSave();
      }

      // 1. Update campaign in database
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          config: campaignData.config,
          design: campaignData.design,
          game_config: campaignData.game_config,
          article_config: campaignData.article_config,
          form_fields: campaignData.form_fields,
          name: campaignData.name,
          description: campaignData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      // 2. Get current revision
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('revision')
        .eq('id', campaignId)
        .single();

      if (fetchError) throw fetchError;

      const currentRevision = (campaign as any)?.revision || 1;

      // 3. Create snapshot
      const { error: snapshotError } = await supabase
        .from('campaign_snapshots')
        .insert({
          campaign_id: campaignId,
          revision: currentRevision,
          config: campaignData.config,
          design: campaignData.design,
          game_config: campaignData.game_config,
          article_config: campaignData.article_config,
          form_fields: campaignData.form_fields,
          snapshot_type: 'manual',
          description: `Sauvegarde manuelle (rev ${currentRevision})`,
          payload_size_bytes: JSON.stringify({
            config: campaignData.config,
            design: campaignData.design,
            game_config: campaignData.game_config,
            article_config: campaignData.article_config,
            form_fields: campaignData.form_fields,
          }).length,
        });

      if (snapshotError) {
        console.warn('Snapshot creation failed (non-blocking):', snapshotError);
      }

      toast.success('Campagne sauvegardée avec succès');
      
      // 4. Navigate to campaigns list
      navigate(redirectPath);
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, navigate]);

  return {
    saveAndExit,
    isSaving
  };
};

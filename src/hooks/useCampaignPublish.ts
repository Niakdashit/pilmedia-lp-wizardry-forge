import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCampaignPublish = () => {
  const [isPublishing, setIsPublishing] = useState(false);

  const publishCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    setIsPublishing(true);
    
    try {
      console.log('📢 [Publish] Publishing campaign:', campaignId);
      
      // Call the publish_campaign function directly
      const { data, error } = await supabase
        .rpc('publish_campaign' as any, {
          p_campaign_id: campaignId,
        });

      if (error) {
        console.error('[Publish] Error:', error);
        throw error;
      }

      const result = data as any;
      if (result?.success) {
        console.log('✅ [Publish] Campaign published successfully');
        toast.success('Campagne publiée avec succès');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Publish] Error publishing campaign:', error);
      toast.error('Erreur lors de la publication');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, []);

  const unpublishCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'draft', published_at: null })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Campagne dépubliée');
      return true;
    } catch (error) {
      console.error('[Publish] Error unpublishing:', error);
      toast.error('Erreur lors de la dépublication');
      return false;
    }
  }, []);

  return {
    publishCampaign,
    unpublishCampaign,
    isPublishing,
  };
};

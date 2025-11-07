import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VersionConflict {
  currentRevision: number;
  serverRevision: number;
  hasConflict: boolean;
}

export interface SaveWithVersionOptions {
  campaignId: string;
  data: any;
  expectedRevision: number;
}

export const useCampaignVersion = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [conflict, setConflict] = useState<VersionConflict | null>(null);

  /**
   * Save with optimistic concurrency control
   * Returns { success, conflict, newRevision }
   */
  const saveWithVersionCheck = useCallback(async (options: SaveWithVersionOptions) => {
    const { campaignId, data, expectedRevision } = options;
    
    try {
      // Attempt update with revision check
      const { data: updated, error } = await supabase
        .from('campaigns')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('revision', expectedRevision) // Optimistic lock
        .select('revision')
        .single();

      if (error) {
        console.error('[useCampaignVersion] Save error:', error);
        throw error;
      }

      if (!updated) {
        // No rows updated = conflict detected
        const { data: serverData } = await supabase
          .from('campaigns')
          .select('revision')
          .eq('id', campaignId)
          .single();

        const serverRevision = (serverData as any)?.revision || expectedRevision + 1;
        
        setConflict({
          currentRevision: expectedRevision,
          serverRevision,
          hasConflict: true,
        });

        return {
          success: false,
          conflict: true,
          newRevision: null,
          serverRevision,
        };
      }

      // Success
      setConflict(null);
      return {
        success: true,
        conflict: false,
        newRevision: (updated as any).revision,
        serverRevision: (updated as any).revision,
      };

    } catch (error) {
      console.error('[useCampaignVersion] Unexpected error:', error);
      return {
        success: false,
        conflict: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, []);

  /**
   * Fetch current server revision
   */
  const fetchCurrentRevision = useCallback(async (campaignId: string) => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('revision')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return (data as any)?.revision || 1;
    } catch (error) {
      console.error('[useCampaignVersion] Error fetching revision:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Resolve conflict by forcing overwrite
   */
  const forceOverwrite = useCallback(async (campaignId: string, data: any) => {
    try {
      const { data: updated, error } = await supabase
        .from('campaigns')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', campaignId)
        .select('revision')
        .single();

      if (error) throw error;

      toast.success('Modifications écrasées avec succès');
      setConflict(null);
      return { success: true, newRevision: (updated as any).revision };
    } catch (error) {
      console.error('[useCampaignVersion] Force overwrite error:', error);
      toast.error('Erreur lors de l\'écrasement');
      return { success: false };
    }
  }, []);

  /**
   * Reload data from server
   */
  const reloadFromServer = useCallback(async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      toast.info('Données rechargées depuis le serveur');
      setConflict(null);
      return { success: true, data };
    } catch (error) {
      console.error('[useCampaignVersion] Reload error:', error);
      toast.error('Erreur lors du rechargement');
      return { success: false };
    }
  }, []);

  /**
   * Clear conflict state
   */
  const clearConflict = useCallback(() => {
    setConflict(null);
  }, []);

  return {
    saveWithVersionCheck,
    fetchCurrentRevision,
    forceOverwrite,
    reloadFromServer,
    clearConflict,
    conflict,
    isChecking,
  };
};

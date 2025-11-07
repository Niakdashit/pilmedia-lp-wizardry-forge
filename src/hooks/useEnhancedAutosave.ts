import { useState, useEffect, useCallback, useRef } from 'react';
import { useOfflineAutosave } from './useOfflineAutosave';
import { useCampaignVersion } from './useCampaignVersion';
import { toast } from 'sonner';
import { saveMetrics } from '@/lib/analytics/saveMetrics';
import { estimateSize } from '@/lib/compression/payloadCompressor';
import { supabase } from '@/integrations/supabase/client';

interface AutosaveOptions {
  enabled?: boolean;
  delay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useEnhancedAutosave = (
  campaignId: string | undefined,
  campaign: any,
  options: AutosaveOptions = {}
) => {
  const {
    enabled = true,
    delay = 3000,
    onSuccess,
    onError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const lastSaveDataRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Offline autosave integration
  const {
    isOnline,
    queueSize,
    isSyncing,
    saveOffline,
    loadDraft,
  } = useOfflineAutosave(campaignId || '');
  
  const { saveWithVersionCheck } = useCampaignVersion();

  // Load draft on mount if exists
  useEffect(() => {
    if (campaignId) {
      loadDraft().then((draft) => {
        if (draft && draft !== campaign) {
          toast.info('Brouillon local trouvé');
        }
      });
    }
  }, [campaignId]);

  // Main save function with retry, offline support, and metrics tracking
  const performSave = useCallback(
    async (dataToSave: any, attempt = 1): Promise<boolean> => {
      const startTime = Date.now();
      const maxRetries = 3;
      const backoffDelay = Math.pow(2, attempt - 1) * 1000;
      const payloadSize = estimateSize(dataToSave);

      // If offline, save to IndexedDB
      if (!isOnline) {
        console.log('📴 [Autosave] Offline - Saving to queue');
        await saveOffline(dataToSave, campaign?.revision || 1);
        
        saveMetrics.track({
          duration: Date.now() - startTime,
          payloadSize,
          success: true,
          retryCount: 0,
          isOnline: false,
        });
        
        return true;
      }

      try {
        console.log(`💾 [Autosave] Attempt ${attempt}/${maxRetries}`);

        const result = await saveWithVersionCheck({
          campaignId: campaignId!,
          data: dataToSave,
          expectedRevision: campaign?.revision || 1,
        });

        if (result.conflict) {
          console.warn('⚠️ [Autosave] Version conflict');
          toast.error('Conflit de version détecté');
          
          saveMetrics.track({
            duration: Date.now() - startTime,
            payloadSize,
            success: false,
            retryCount: attempt - 1,
            isOnline: true,
            error: 'Version conflict',
          });
          
          return false;
        }

        if (!result.success) {
          throw new Error('Save failed');
        }

        // Synchronize campaign_settings.publication.name with campaign.name
        if (dataToSave.name && campaignId) {
          try {
            const { data: settings } = await supabase
              .from('campaign_settings')
              .select('publication')
              .eq('campaign_id', campaignId)
              .single();
            
            const existingPublication = (settings?.publication || {}) as Record<string, any>;
            
            await supabase
              .from('campaign_settings')
              .upsert({
                campaign_id: campaignId,
                publication: {
                  ...existingPublication,
                  name: dataToSave.name
                }
              });
          } catch (syncError) {
            // Non-blocking error, just log it
            console.warn('[Autosave] Failed to sync campaign_settings name:', syncError);
          }
        }

        saveMetrics.track({
          duration: Date.now() - startTime,
          payloadSize,
          success: true,
          retryCount: attempt - 1,
          isOnline: true,
        });

        return true;
      } catch (error) {
        console.error(`❌ [Autosave] Attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          return performSave(dataToSave, attempt + 1);
        }

        // Fallback to offline
        await saveOffline(dataToSave, campaign?.revision || 1);
        
        saveMetrics.track({
          duration: Date.now() - startTime,
          payloadSize,
          success: false,
          retryCount: attempt - 1,
          isOnline: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        throw error;
      }
    },
    [campaignId, campaign?.revision, isOnline, saveOffline, saveWithVersionCheck]
  );

  // Debounced autosave
  const debouncedSave = useCallback(
    (dataToSave: any) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        if (!campaignId || !enabled) return;

        const currentData = JSON.stringify(dataToSave);
        if (currentData === lastSaveDataRef.current) {
          return;
        }

        setIsSaving(true);
        setHasUnsavedChanges(false);

        try {
          await performSave(dataToSave);
          lastSaveDataRef.current = currentData;
          setLastSaved(new Date());
          onSuccess?.();
        } catch (error) {
          console.error('[Autosave] Error:', error);
          setHasUnsavedChanges(true);
          onError?.(error as Error);
        } finally {
          setIsSaving(false);
        }
      }, delay);
    },
    [campaignId, enabled, delay, performSave, onSuccess, onError]
  );

  // Trigger autosave on campaign changes
  useEffect(() => {
    if (campaign && enabled) {
      setHasUnsavedChanges(true);
      debouncedSave(campaign);
    }
  }, [campaign, enabled, debouncedSave]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Manual save trigger
  const triggerManualSave = useCallback(async () => {
    if (!campaignId || !campaign) return;

    setIsSaving(true);
    try {
      await performSave(campaign);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Sauvegarde réussie');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [campaignId, campaign, performSave]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    triggerManualSave,
    isOnline,
    queueSize,
    isSyncing,
  };
};

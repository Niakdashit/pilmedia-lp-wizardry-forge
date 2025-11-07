import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineDB, QueuedSave } from '@/lib/db/offlineQueue';
import { useCampaignVersion } from './useCampaignVersion';
import { toast } from 'sonner';

export const useOfflineAutosave = (campaignId: string) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  
  const { saveWithVersionCheck } = useCampaignVersion();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 [OfflineAutosave] Back online');
      setIsOnline(true);
      toast.success('Connexion rétablie - Synchronisation...');
      syncQueue();
    };

    const handleOffline = () => {
      console.log('📴 [OfflineAutosave] Went offline');
      setIsOnline(false);
      toast.warning('Mode hors ligne - Les modifications seront sauvegardées localement');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update queue size
  const updateQueueSize = useCallback(async () => {
    try {
      const queue = await offlineDB.getQueue();
      setQueueSize(queue.length);
    } catch (error) {
      console.error('[OfflineAutosave] Error updating queue size:', error);
    }
  }, []);

  // Save offline
  const saveOffline = useCallback(async (data: any, revision: number) => {
    try {
      const queueItem: QueuedSave = {
        id: `${campaignId}-${Date.now()}`,
        campaignId,
        data: { ...data, revision },
        timestamp: Date.now(),
        retries: 0,
      };

      await offlineDB.addToQueue(queueItem);
      await offlineDB.saveDraft(campaignId, data);
      await updateQueueSize();

      console.log('💾 [OfflineAutosave] Saved offline:', queueItem.id);
      toast.info('Modifications enregistrées localement (hors ligne)');
    } catch (error) {
      console.error('[OfflineAutosave] Error saving offline:', error);
      toast.error('Erreur lors de la sauvegarde locale');
    }
  }, [campaignId, updateQueueSize]);

  // Sync queue to server
  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const queue = await offlineDB.getQueue();
      console.log(`🔄 [OfflineAutosave] Syncing ${queue.length} items...`);

      for (const item of queue) {
        try {
          const result = await saveWithVersionCheck({
            campaignId: item.campaignId,
            data: item.data,
            expectedRevision: item.data.revision,
          });

          if (result.success) {
            await offlineDB.removeFromQueue(item.id);
            await offlineDB.clearDraft(item.campaignId);
            console.log('✅ [OfflineAutosave] Synced:', item.id);
          } else if (result.conflict) {
            console.warn('⚠️ [OfflineAutosave] Conflict for:', item.id);
            item.error = 'Version conflict';
            item.retries++;
            
            if (item.retries < 3) {
              await offlineDB.addToQueue(item);
            } else {
              toast.error(`Conflit de version pour ${item.campaignId}`);
            }
          }
        } catch (error) {
          console.error('[OfflineAutosave] Sync error:', error);
          item.error = error instanceof Error ? error.message : 'Unknown error';
          item.retries++;
          
          if (item.retries < 3) {
            await offlineDB.addToQueue(item);
          }
        }
      }

      await updateQueueSize();
      
      if (queue.length > 0) {
        toast.success('Synchronisation terminée');
      }
    } catch (error) {
      console.error('[OfflineAutosave] Queue sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, saveWithVersionCheck, updateQueueSize]);

  // Auto-sync every 30 seconds when online
  useEffect(() => {
    if (isOnline) {
      syncIntervalRef.current = setInterval(syncQueue, 30000);
      syncQueue(); // Sync immediately
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, syncQueue]);

  // Load draft on mount
  const loadDraft = useCallback(async () => {
    try {
      const draft = await offlineDB.getDraft(campaignId);
      return draft;
    } catch (error) {
      console.error('[OfflineAutosave] Error loading draft:', error);
      return null;
    }
  }, [campaignId]);

  // Initial queue size
  useEffect(() => {
    updateQueueSize();
  }, [updateQueueSize]);

  return {
    isOnline,
    queueSize,
    isSyncing,
    saveOffline,
    syncQueue,
    loadDraft,
  };
};

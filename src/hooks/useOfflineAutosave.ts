import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineDB, QueuedSave } from '@/lib/db/offlineQueue';
import { useCampaignVersion } from './useCampaignVersion';
import { toast } from 'sonner';
import { buildCampaignUpdatePayload } from '@/lib/campaign/buildDbPayload';

// Minimal sanitizer to avoid server errors on volatile/local-only fields
const VOLATILE_KEYS = new Set(['_syncTimestamp', '_updatedAt', '_lastUpdate']);
const sanitizeReplacer = (key: string, value: any) => {
  if (key.startsWith('_')) return undefined;
  if (VOLATILE_KEYS.has(key)) return undefined;
  if (typeof value === 'function') return undefined;
  return value;
};
const sanitizePayload = (obj: any) => {
  try {
    return JSON.parse(JSON.stringify(obj, sanitizeReplacer));
  } catch {
    return obj;
  }
};

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
      const sanitized = sanitizePayload(data);
      const queueItem: QueuedSave = {
        id: `${campaignId}-${Date.now()}`,
        campaignId,
        data: { ...sanitized, revision },
        timestamp: Date.now(),
        retries: 0,
      };

      await offlineDB.addToQueue(queueItem);
      await offlineDB.saveDraft(campaignId, sanitized);
      await updateQueueSize();

      console.log('💾 [OfflineAutosave] Saved offline:', queueItem.id);
      toast.info('Modifications enregistrées localement (hors ligne)');
    } catch (error) {
      console.error('[OfflineAutosave] Error saving offline:', error);
      toast.error('Erreur lors de la sauvegarde locale');
    }
  }, [campaignId, updateQueueSize]);

  // Sync queue to server with batching
  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    const startTime = Date.now();
    
    try {
      const queue = await offlineDB.getQueue();
      console.log(`🔄 [OfflineAutosave] Syncing ${queue.length} items...`);

      if (queue.length === 0) return;

      // Group by campaign and sort by timestamp
      const grouped = queue.reduce((acc, item) => {
        if (!acc[item.campaignId]) acc[item.campaignId] = [];
        acc[item.campaignId].push(item);
        return acc;
      }, {} as Record<string, QueuedSave[]>);

      // Process each campaign's queue
      for (const [campaignId, items] of Object.entries(grouped)) {
        const sorted = items.sort((a, b) => a.timestamp - b.timestamp);
        
        // Batch: take only the latest item per campaign if multiple
        const latestItem = sorted[sorted.length - 1];
        
        try {
          const sanitized = sanitizePayload(latestItem.data);
          const dbPayload = buildCampaignUpdatePayload(sanitized);
          
          const result = await saveWithVersionCheck({
            campaignId: latestItem.campaignId,
            data: dbPayload,
            expectedRevision: sanitized.revision,
          });

          if (result.success) {
            // Remove all synced items for this campaign
            for (const item of sorted) {
              await offlineDB.removeFromQueue(item.id);
            }
            await offlineDB.clearDraft(latestItem.campaignId);
            console.log(`✅ [OfflineAutosave] Synced ${sorted.length} items for ${campaignId}`);
          } else if (result.conflict) {
            console.warn('⚠️ [OfflineAutosave] Conflict for:', latestItem.id);
            latestItem.error = 'Version conflict';
            latestItem.retries++;
            
            if (latestItem.retries < 3) {
              await offlineDB.addToQueue(latestItem);
            } else {
              toast.error(`Conflit de version pour ${latestItem.campaignId}`);
            }
          }
        } catch (error) {
          console.error('[OfflineAutosave] Sync error:', error);
          latestItem.error = error instanceof Error ? error.message : 'Unknown error';
          latestItem.retries++;
          
          if (latestItem.retries < 3) {
            await offlineDB.addToQueue(latestItem);
          }
        }
      }

      await updateQueueSize();
      
      const duration = Date.now() - startTime;
      console.log(`✅ [OfflineAutosave] Sync completed in ${duration}ms`);
      
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

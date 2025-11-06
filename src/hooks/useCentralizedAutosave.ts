import { useEffect, useRef, useCallback, useState } from 'react';
import { debounce } from 'lodash-es';
import { saveCampaignToDB } from './useModernCampaignEditor/saveHandler';
import { emitCampaignEvent } from '@/utils/campaignEvents';

interface CentralizedAutosaveOptions {
  campaign: any;
  saveCampaign: (data: any) => Promise<any>;
  delay?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

/**
 * Métriques de performance pour le debugging
 */
interface SaveMetrics {
  totalSaves: number;
  successfulSaves: number;
  failedSaves: number;
  averageSaveTime: number;
  lastSaveDuration: number;
}

const globalMetrics: SaveMetrics = {
  totalSaves: 0,
  successfulSaves: 0,
  failedSaves: 0,
  averageSaveTime: 0,
  lastSaveDuration: 0
};

/**
 * Utilitaire de retry avec backoff exponentiel
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.warn(`⚠️ [CentralizedAutosave] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Hook centralisé pour gérer l'autosave de manière coordonnée
 * 
 * Features:
 * - Debounced autosave avec détection de changements
 * - Retry automatique avec backoff exponentiel (3 tentatives)
 * - Métriques de performance (temps de sauvegarde, taux de succès)
 * - Gestion d'erreurs robuste
 * - Protection contre les sauvegardes concurrentes
 */
export const useCentralizedAutosave = ({
  campaign,
  saveCampaign,
  delay = 2000,
  enabled = true,
  onError,
  maxRetries = 3
}: CentralizedAutosaveOptions) => {
  const isSavingRef = useRef(false);
  const lastSavedHashRef = useRef<string>('');
  const pendingSaveRef = useRef<NodeJS.Timeout | null>(null);
  
  // États pour l'indicateur visuel
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>();
  
  /**
   * Sauvegarde avec debounce et gestion des conflits
   */
  const debouncedSave = useCallback(
    debounce(async (campaignToSave: any) => {
      if (!enabled || isSavingRef.current) return;
      
      // Vérifier si les données ont vraiment changé
      const currentHash = JSON.stringify({
        id: campaignToSave?.id,
        name: campaignToSave?.name,
        canvasElements: campaignToSave?.canvasElements,
        modularPage: campaignToSave?.modularPage,
        screenBackgrounds: campaignToSave?.screenBackgrounds,
        extractedColors: campaignToSave?.extractedColors
      });
      
      if (currentHash === lastSavedHashRef.current) {
        console.log('⏭️ [CentralizedAutosave] Skipping save - no changes detected');
        return;
      }
      
      isSavingRef.current = true;
      setIsSaving(true);
      setSaveError(null);
      
      const startTime = performance.now();
      
      try {
        emitCampaignEvent('campaign:autosave:start', {
          campaignId: campaignToSave?.id || 'new',
          source: 'centralized-autosave'
        });
        
        console.log('💾 [CentralizedAutosave] Saving campaign:', campaignToSave?.id);
        
        // Sauvegarde avec retry automatique
        const saved = await retryWithBackoff(
          () => saveCampaignToDB(campaignToSave, saveCampaign),
          maxRetries,
          1000 // 1s base delay
        );
        
        const duration = performance.now() - startTime;
        
        // Mise à jour des métriques
        globalMetrics.totalSaves++;
        globalMetrics.successfulSaves++;
        globalMetrics.lastSaveDuration = duration;
        globalMetrics.averageSaveTime = 
          (globalMetrics.averageSaveTime * (globalMetrics.totalSaves - 1) + duration) / globalMetrics.totalSaves;
        
        lastSavedHashRef.current = currentHash;
        setLastSavedAt(new Date());
        
        emitCampaignEvent('campaign:autosave:complete', {
          campaignId: saved?.id || campaignToSave?.id,
          data: saved,
          source: 'centralized-autosave'
        });
        
        console.log(`✅ [CentralizedAutosave] Save complete in ${duration.toFixed(0)}ms:`, saved?.id);
        
        // Log metrics en dev
        if (process.env.NODE_ENV !== 'production') {
          console.log('📊 [SaveMetrics]', {
            totalSaves: globalMetrics.totalSaves,
            successRate: `${((globalMetrics.successfulSaves / globalMetrics.totalSaves) * 100).toFixed(1)}%`,
            avgTime: `${globalMetrics.averageSaveTime.toFixed(0)}ms`,
            lastTime: `${duration.toFixed(0)}ms`
          });
        }
      } catch (error) {
        const duration = performance.now() - startTime;
        
        // Mise à jour des métriques d'erreur
        globalMetrics.totalSaves++;
        globalMetrics.failedSaves++;
        globalMetrics.lastSaveDuration = duration;
        
        console.error(`❌ [CentralizedAutosave] Save failed after ${duration.toFixed(0)}ms:`, error);
        console.error('📊 [SaveMetrics] Failure rate:', 
          `${((globalMetrics.failedSaves / globalMetrics.totalSaves) * 100).toFixed(1)}%`
        );
        
        setSaveError(error as Error);
        onError?.(error as Error);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    }, delay),
    [saveCampaign, delay, enabled, onError]
  );
  
  /**
   * Sauvegarde immédiate (sans debounce)
   */
  const forceSave = useCallback(async () => {
    if (isSavingRef.current) {
      console.log('⏳ [CentralizedAutosave] Save already in progress, waiting...');
      return;
    }
    
    // Annuler le debounce en cours et sauvegarder immédiatement
    debouncedSave.cancel();
    
    if (!campaign?.id) return;
    
    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    
    const startTime = performance.now();
    
    try {
      console.log('⚡ [CentralizedAutosave] Force saving campaign:', campaign.id);
      
      // Force save avec retry
      const saved = await retryWithBackoff(
        () => saveCampaignToDB(campaign, saveCampaign),
        maxRetries,
        1000
      );
      
      const duration = performance.now() - startTime;
      
      lastSavedHashRef.current = JSON.stringify({
        id: campaign?.id,
        name: campaign?.name,
        canvasElements: campaign?.canvasElements,
        modularPage: campaign?.modularPage,
        screenBackgrounds: campaign?.screenBackgrounds,
        extractedColors: campaign?.extractedColors
      });
      
      setLastSavedAt(new Date());
      
      console.log(`✅ [CentralizedAutosave] Force save complete in ${duration.toFixed(0)}ms:`, saved?.id);
      return saved;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ [CentralizedAutosave] Force save failed after ${duration.toFixed(0)}ms:`, error);
      setSaveError(error as Error);
      onError?.(error as Error);
      throw error;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [campaign, saveCampaign, onError, debouncedSave]);
  
  /**
   * Attendre la fin d'une sauvegarde en cours
   */
  const waitForSave = useCallback(async () => {
    if (!isSavingRef.current) return;
    
    console.log('⏳ [CentralizedAutosave] Waiting for save to complete...');
    
    // Attendre max 5 secondes
    const maxWait = 5000;
    const startTime = Date.now();
    
    while (isSavingRef.current && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (isSavingRef.current) {
      console.warn('⚠️ [CentralizedAutosave] Save timeout - continuing anyway');
    }
  }, []);
  
  /**
   * Déclencher l'autosave quand la campagne change
   */
  useEffect(() => {
    if (!enabled || !campaign?.id) return;
    
    debouncedSave(campaign);
    
    return () => {
      debouncedSave.cancel();
    };
  }, [campaign, enabled, debouncedSave]);
  
  /**
   * Nettoyage lors du démontage
   */
  useEffect(() => {
    return () => {
      // Annuler les sauvegardes en attente
      debouncedSave.cancel();
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
    };
  }, [debouncedSave]);
  
  return {
    isSaving,
    saveError,
    lastSavedAt,
    forceSave,
    waitForSave,
    cancelPendingSave: () => debouncedSave.cancel(),
    // Métriques exposées pour debugging
    metrics: globalMetrics
  };
};

/**
 * Hook pour accéder aux métriques globales de sauvegarde
 */
export const useSaveMetrics = () => globalMetrics;

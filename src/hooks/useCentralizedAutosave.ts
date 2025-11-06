import { useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash-es';
import { saveCampaignToDB } from './useModernCampaignEditor/saveHandler';
import { emitCampaignEvent } from '@/utils/campaignEvents';

interface CentralizedAutosaveOptions {
  campaign: any;
  saveCampaign: (data: any) => Promise<any>;
  delay?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Hook centralisé pour gérer l'autosave de manière coordonnée
 * Remplace tous les systèmes d'autosave éparpillés
 */
export const useCentralizedAutosave = ({
  campaign,
  saveCampaign,
  delay = 2000,
  enabled = true,
  onError
}: CentralizedAutosaveOptions) => {
  const isSavingRef = useRef(false);
  const lastSavedHashRef = useRef<string>('');
  const pendingSaveRef = useRef<NodeJS.Timeout | null>(null);
  
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
      
      try {
        emitCampaignEvent('campaign:autosave:start', {
          campaignId: campaignToSave?.id || 'new',
          source: 'centralized-autosave'
        });
        
        console.log('💾 [CentralizedAutosave] Saving campaign:', campaignToSave?.id);
        
        const saved = await saveCampaignToDB(campaignToSave, saveCampaign);
        
        lastSavedHashRef.current = currentHash;
        
        emitCampaignEvent('campaign:autosave:complete', {
          campaignId: saved?.id || campaignToSave?.id,
          data: saved,
          source: 'centralized-autosave'
        });
        
        console.log('✅ [CentralizedAutosave] Save complete:', saved?.id);
      } catch (error) {
        console.error('❌ [CentralizedAutosave] Save failed:', error);
        onError?.(error as Error);
      } finally {
        isSavingRef.current = false;
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
    
    try {
      console.log('⚡ [CentralizedAutosave] Force saving campaign:', campaign.id);
      const saved = await saveCampaignToDB(campaign, saveCampaign);
      
      lastSavedHashRef.current = JSON.stringify({
        id: campaign?.id,
        name: campaign?.name,
        canvasElements: campaign?.canvasElements,
        modularPage: campaign?.modularPage,
        screenBackgrounds: campaign?.screenBackgrounds,
        extractedColors: campaign?.extractedColors
      });
      
      console.log('✅ [CentralizedAutosave] Force save complete:', saved?.id);
      return saved;
    } catch (error) {
      console.error('❌ [CentralizedAutosave] Force save failed:', error);
      onError?.(error as Error);
      throw error;
    } finally {
      isSavingRef.current = false;
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
    isSaving: isSavingRef.current,
    forceSave,
    waitForSave,
    cancelPendingSave: () => debouncedSave.cancel()
  };
};

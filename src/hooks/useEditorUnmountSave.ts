import { useEffect, useRef } from 'react';
import { useCampaignStateSync } from './useCampaignStateSync';
import { saveCampaignToDB } from './useModernCampaignEditor/saveHandler';
import { useEditorStore } from '../stores/editorStore';

/**
 * Phase 1: Hook pour sauvegarder automatiquement l'état complet de l'éditeur au démontage
 * Garantit que TOUTES les données sont persistées avant de quitter l'éditeur
 */
interface EditorUnmountSaveOptions {
  editorType: 'design' | 'quiz' | 'form' | 'scratch' | 'jackpot';
  canvasElements: any[];
  modularPage: any;
  screenBackgrounds: any;
  extractedColors: string[];
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  canvasZoom: number;
  specificConfig?: any; // quizConfig, scratchConfig, jackpotConfig, etc.
  saveCampaign: (campaign: any) => Promise<any>;
  onUnmount?: () => void;
}

export const useEditorUnmountSave = ({
  editorType,
  canvasElements,
  modularPage,
  screenBackgrounds,
  extractedColors,
  selectedDevice,
  canvasZoom,
  specificConfig,
  saveCampaign,
  onUnmount
}: EditorUnmountSaveOptions) => {
  const { syncAllStates } = useCampaignStateSync();
  const { campaign: storeCampaign, resetCampaign } = useEditorStore();
  const isSavingRef = useRef(false);

  useEffect(() => {
    return () => {
      // Éviter les sauvegardes multiples
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      console.log(`🔄 [${editorType}Editor] Unmount - Saving complete state`);

      try {
        // 1. Sync local → store
        syncAllStates({
          canvasElements,
          modularPage,
          screenBackgrounds,
          extractedColors,
          selectedDevice,
          canvasZoom
        });

        // 2. Build payload complet avec type + config spécifique
        const base = useEditorStore.getState().campaign || storeCampaign || {};
        const campaignId = (base as any)?.id;
        
        // Vérifier si c'est un UUID valide
        const isUuid = (id?: string) => 
          !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        if (isUuid(campaignId)) {
          const payload: any = {
            ...base,
            type: editorType === 'design' ? (base as any)?.type || 'wheel' : editorType,
            modularPage,
            canvasElements,
            screenBackgrounds,
            extractedColors,
            selectedDevice,
            canvasZoom,
            canvasConfig: {
              ...((base as any)?.canvasConfig || {}),
              elements: canvasElements,
              screenBackgrounds,
              device: selectedDevice,
              zoom: canvasZoom
            }
          };

          // Ajouter la config spécifique selon le type d'éditeur
          if (specificConfig) {
            const configKey = `${editorType}Config`;
            payload[configKey] = specificConfig;
          }

          // 3. Save puis reset
          try {
            void saveCampaignToDB(payload, saveCampaign);
            console.log(`✅ [${editorType}Editor] State saved on unmount`);
          } catch (error) {
            console.error(`❌ [${editorType}Editor] Failed to save on unmount:`, error);
          }
        }

        // 4. Callback optionnel avant reset
        onUnmount?.();

        // 5. Reset store
        resetCampaign();
      } catch (error) {
        console.error(`❌ [${editorType}Editor] Unmount save failed:`, error);
      }
    };
  }, [
    editorType,
    canvasElements,
    modularPage,
    screenBackgrounds,
    extractedColors,
    selectedDevice,
    canvasZoom,
    specificConfig,
    saveCampaign,
    syncAllStates,
    storeCampaign,
    resetCampaign,
    onUnmount
  ]);
};

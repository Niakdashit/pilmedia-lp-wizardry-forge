import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useCampaignStateSync } from './useCampaignStateSync';
import { saveCampaignToDB } from './useModernCampaignEditor/saveHandler';

interface EditorStates {
  canvasElements: any[];
  modularPage: any;
  screenBackgrounds: any;
  extractedColors: string[];
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  canvasZoom: number;
  gameConfig?: any;
}

/**
 * Hook pour sauvegarder automatiquement avant l'unmount de l'éditeur
 * Garantit qu'aucune donnée n'est perdue lors de la fermeture
 */
export const useEditorUnmountSave = (
  campaignType: 'wheel' | 'quiz' | 'form' | 'scratch' | 'jackpot',
  states: EditorStates,
  saveCampaign: (campaign: any) => Promise<any>
) => {
  const { syncAllStates } = useCampaignStateSync();
  const { resetCampaign } = useEditorStore();
  const campaignState = useEditorStore(s => s.campaign);

  useEffect(() => {
    return () => {
      console.log(`🧹 [${campaignType}Editor] Unmounting - saving before reset`);
      
      try {
        const id = (campaignState as any)?.id;
        const isUuid = (v?: string) => 
          !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
        
        if (isUuid(id)) {
          // 1. Sync local → store
          syncAllStates({
            canvasElements: states.canvasElements,
            modularPage: states.modularPage,
            screenBackgrounds: states.screenBackgrounds,
            extractedColors: states.extractedColors,
            selectedDevice: states.selectedDevice,
            canvasZoom: states.canvasZoom
          });

          // 2. Build complete payload
          const base = useEditorStore.getState().campaign || campaignState || {};
          const payload: any = {
            ...base,
            type: campaignType,
            extractedColors: states.extractedColors,
            modularPage: states.modularPage,
            canvasElements: states.canvasElements,
            screenBackgrounds: states.screenBackgrounds,
            selectedDevice: states.selectedDevice,
            canvasZoom: states.canvasZoom,
            canvasConfig: {
              ...(base as any)?.canvasConfig,
              elements: states.canvasElements,
              screenBackgrounds: states.screenBackgrounds,
              device: states.selectedDevice,
              zoom: states.canvasZoom
            }
          };

          // Add game-specific config
          if (states.gameConfig) {
            const configKey = `${campaignType}Config`;
            payload[configKey] = states.gameConfig;
          }

          // 3. Save then reset
          console.log(`💾 [${campaignType}Editor] Saving complete state before unmount`);
          void saveCampaignToDB(payload, saveCampaign);
        }
      } catch (e) {
        console.error(`❌ [${campaignType}Editor] Failed to save on unmount:`, e);
      }
      
      resetCampaign();
    };
  }, [
    campaignType,
    states.canvasElements,
    states.modularPage,
    states.screenBackgrounds,
    states.extractedColors,
    states.selectedDevice,
    states.canvasZoom,
    states.gameConfig,
    campaignState,
    syncAllStates,
    saveCampaign,
    resetCampaign
  ]); // CRITICAL: Include all state dependencies to capture latest values
};

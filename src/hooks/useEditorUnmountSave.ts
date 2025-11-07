import { useEffect, useRef } from 'react';
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

  // Use refs to capture latest values without triggering re-creation
  const statesRef = useRef(states);
  const saveCampaignRef = useRef(saveCampaign);
  const syncAllStatesRef = useRef(syncAllStates);

  // Update refs on each render
  useEffect(() => {
    statesRef.current = states;
    saveCampaignRef.current = saveCampaign;
    syncAllStatesRef.current = syncAllStates;
  });

  useEffect(() => {
    return () => {
      console.log(`🧹 [${campaignType}Editor] Unmounting - saving before reset`);
      
      try {
        const id = (campaignState as any)?.id;
        const isUuid = (v?: string) => 
          !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
        
        if (isUuid(id)) {
          const currentStates = statesRef.current;
          
          // 1. Sync local → store
          syncAllStatesRef.current({
            canvasElements: currentStates.canvasElements,
            modularPage: currentStates.modularPage,
            screenBackgrounds: currentStates.screenBackgrounds,
            extractedColors: currentStates.extractedColors,
            selectedDevice: currentStates.selectedDevice,
            canvasZoom: currentStates.canvasZoom
          });

          // 2. Build complete payload
          const base = useEditorStore.getState().campaign || {};
          const payload: any = {
            ...base,
            type: campaignType,
            extractedColors: currentStates.extractedColors,
            modularPage: currentStates.modularPage,
            canvasElements: currentStates.canvasElements,
            screenBackgrounds: currentStates.screenBackgrounds,
            selectedDevice: currentStates.selectedDevice,
            canvasZoom: currentStates.canvasZoom,
            canvasConfig: {
              ...(base as any)?.canvasConfig,
              elements: currentStates.canvasElements,
              screenBackgrounds: currentStates.screenBackgrounds,
              device: currentStates.selectedDevice,
              zoom: currentStates.canvasZoom
            }
          };

          // Add game-specific config
          if (currentStates.gameConfig) {
            const configKey = `${campaignType}Config`;
            payload[configKey] = currentStates.gameConfig;
          }

          // 3. Save then reset
          console.log(`💾 [${campaignType}Editor] Saving complete state before unmount`);
          void saveCampaignToDB(payload, saveCampaignRef.current);
        }
      } catch (e) {
        console.error(`❌ [${campaignType}Editor] Failed to save on unmount:`, e);
      }
      
      resetCampaign();
    };
  }, [
    campaignType,
    resetCampaign
  ]); // Minimal deps - refs capture latest values
};

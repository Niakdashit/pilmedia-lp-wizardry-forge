import { useCallback } from 'react';
import { useEditorStore } from '../stores/editorStore';

/**
 * Hook pour synchroniser automatiquement les états locaux de l'éditeur
 * avec l'objet campaign avant la sauvegarde
 * 
 * Cela garantit que tous les éléments configurés (canvas, modules, backgrounds, etc.)
 * sont correctement persistés en base de données
 */
export const useCampaignStateSync = () => {
  const { setCampaign } = useEditorStore();

  /**
   * Synchronise tous les états de l'éditeur avec l'objet campaign
   * À appeler avant chaque sauvegarde pour garantir la persistance complète
   */
  const syncAllStates = useCallback((editorStates: {
    canvasElements?: any[];
    modularPage?: any;
    screenBackgrounds?: any;
    extractedColors?: string[];
    canvasZoom?: number;
    selectedDevice?: 'desktop' | 'tablet' | 'mobile';
    campaignConfig?: any;
    buttonConfig?: any;
    screens?: any;
    wheelConfig?: any;
    quizConfig?: any;
    scratchConfig?: any;
    jackpotConfig?: any;
  }) => {
    setCampaign((prev: any) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        
        // Synchroniser les éléments du canvas
        ...(editorStates.canvasElements !== undefined && {
          canvasElements: editorStates.canvasElements
        }),
        
        // Synchroniser la structure modulaire
        ...(editorStates.modularPage !== undefined && {
          modularPage: editorStates.modularPage
        }),
        
        // Synchroniser les backgrounds par écran
        ...(editorStates.screenBackgrounds !== undefined && {
          screenBackgrounds: editorStates.screenBackgrounds
        }),
        
        // Synchroniser les couleurs extraites
        ...(editorStates.extractedColors !== undefined && {
          extractedColors: editorStates.extractedColors
        }),
        
        // Synchroniser l'état du canvas (device, zoom)
        ...(editorStates.selectedDevice !== undefined && {
          selectedDevice: editorStates.selectedDevice
        }),
        ...(editorStates.canvasZoom !== undefined && {
          canvasZoom: editorStates.canvasZoom
        }),
        
        // Synchroniser les configurations
        ...(editorStates.campaignConfig !== undefined && {
          campaignConfig: editorStates.campaignConfig
        }),
        ...(editorStates.buttonConfig !== undefined && {
          buttonConfig: editorStates.buttonConfig
        }),
        ...(editorStates.screens !== undefined && {
          screens: editorStates.screens
        }),
        
        // Synchroniser les configs spécifiques par type de jeu
        ...(editorStates.wheelConfig !== undefined && {
          wheelConfig: editorStates.wheelConfig
        }),
        ...(editorStates.quizConfig !== undefined && {
          quizConfig: editorStates.quizConfig
        }),
        ...(editorStates.scratchConfig !== undefined && {
          scratchConfig: editorStates.scratchConfig
        }),
        ...(editorStates.jackpotConfig !== undefined && {
          jackpotConfig: editorStates.jackpotConfig
        }),
        
        // Timestamp de synchronisation
        _lastSync: Date.now()
      };

      console.log('🔄 [useCampaignStateSync] States synced to campaign:', {
        id: updated.id,
        name: updated.name,
        syncedStates: Object.keys(editorStates),
        canvasElementsCount: updated.canvasElements?.length || 0,
        modularPageScreens: Object.keys(updated.modularPage?.screens || {}).length,
        screenBackgroundsCount: Object.keys(updated.screenBackgrounds || {}).length
      });

      return updated;
    });
  }, [setCampaign]);

  /**
   * Synchronise uniquement les éléments du canvas
   */
  const syncCanvasElements = useCallback((elements: any[]) => {
    syncAllStates({ canvasElements: elements });
  }, [syncAllStates]);

  /**
   * Synchronise uniquement la structure modulaire
   */
  const syncModularPage = useCallback((modularPage: any) => {
    syncAllStates({ modularPage });
  }, [syncAllStates]);

  /**
   * Synchronise uniquement les backgrounds
   */
  const syncBackgrounds = useCallback((screenBackgrounds: any) => {
    syncAllStates({ screenBackgrounds });
  }, [syncAllStates]);

  /**
   * Synchronise uniquement les couleurs extraites
   */
  const syncColors = useCallback((extractedColors: string[]) => {
    syncAllStates({ extractedColors });
  }, [syncAllStates]);

  return {
    syncAllStates,
    syncCanvasElements,
    syncModularPage,
    syncBackgrounds,
    syncColors
  };
};

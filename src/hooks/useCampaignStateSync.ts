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
  /**
   * Phase 2: Synchronisation enrichie avec extraction d'images
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

      // Phase 4: Extraire les images utilisées
      const extractImages = () => {
        const images = new Set<string>();
        
        // Images des modules
        if (editorStates.modularPage?.screens) {
          Object.values(editorStates.modularPage.screens).forEach((modules: any) => {
            if (!Array.isArray(modules)) return;
            modules.forEach((module: any) => {
              if (module.type === 'BlocImage' && module.src) images.add(module.src);
              if (module.backgroundImage) images.add(module.backgroundImage);
              if (module.type === 'BlocProfil' && module.avatarUrl) images.add(module.avatarUrl);
              if (module.type === 'BlocHeader' && module.logoUrl) images.add(module.logoUrl);
            });
          });
        }

        // Images des backgrounds
        if (editorStates.screenBackgrounds) {
          Object.values(editorStates.screenBackgrounds).forEach((bg: any) => {
            if (bg?.type === 'image' && bg?.value) images.add(bg.value);
            if (bg?.desktop?.type === 'image' && bg?.desktop?.value) images.add(bg.desktop.value);
            if (bg?.tablet?.type === 'image' && bg?.tablet?.value) images.add(bg.tablet.value);
            if (bg?.mobile?.type === 'image' && bg?.mobile?.value) images.add(bg.mobile.value);
          });
        }

        // Images du canvas
        if (editorStates.canvasElements) {
          editorStates.canvasElements.forEach((el: any) => {
            if (el.type === 'image' && el.src) images.add(el.src);
            if (el.backgroundImage) images.add(el.backgroundImage);
          });
        }

        return Array.from(images);
      };

      const customImages = extractImages();

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
        
        // Phase 2: Synchroniser les couleurs extraites (PARTOUT)
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
        
        // Phase 4: Ajouter les images extraites dans design.customImages
        design: {
          ...(prev.design || {}),
          customImages: customImages.length > 0 ? customImages : (prev.design?.customImages || [])
        },
        
        // Timestamp de synchronisation
        _lastSync: Date.now()
      };

      console.log('🔄 [useCampaignStateSync] States synced to campaign:', {
        id: updated.id,
        name: updated.name,
        syncedStates: Object.keys(editorStates),
        canvasElementsCount: updated.canvasElements?.length || 0,
        modularPageScreens: Object.keys(updated.modularPage?.screens || {}).length,
        screenBackgroundsCount: Object.keys(updated.screenBackgrounds || {}).length,
        extractedColorsCount: updated.extractedColors?.length || 0,
        customImagesCount: customImages.length
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

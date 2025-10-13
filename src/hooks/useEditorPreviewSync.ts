import { useCallback, useRef } from 'react';
import { useEditorStore } from '../stores/editorStore';

/**
 * Hook de synchronisation robuste entre le mode édition et le mode preview
 * Garantit que tous les changements sont instantanément reflétés dans les deux modes
 */
export const useEditorPreviewSync = () => {
  const campaign = useEditorStore((state) => state.campaign);
  const setCampaign = useEditorStore((state) => state.setCampaign);
  const lastSyncRef = useRef<string>('');

  /**
   * Synchronise l'image de fond entre l'éditeur et le preview
   */
  const syncBackground = useCallback((background: { type: 'color' | 'image'; value: string }, device: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    setCampaign((prev: any) => {
      const updated = {
        ...prev,
        design: {
          ...prev?.design,
          background,
          // Synchroniser aussi dans les propriétés spécifiques device
          ...(device === 'mobile' 
            ? { mobileBackgroundImage: background.type === 'image' ? background.value : undefined }
            : { backgroundImage: background.type === 'image' ? background.value : undefined }
          )
        },
        canvasConfig: {
          ...prev?.canvasConfig,
          background
        },
        _syncTimestamp: Date.now()
      };
      
      console.log('🔄 [useEditorPreviewSync] Background synced:', {
        type: background.type,
        device,
        timestamp: updated._syncTimestamp
      });
      
      return updated;
    });

    // Émettre un événement pour forcer le re-render du preview
    window.dispatchEvent(new CustomEvent('editor-background-sync', { 
      detail: { background, device, timestamp: Date.now() } 
    }));
  }, [setCampaign]);

  /**
   * Synchronise les modules modulaires entre l'éditeur et le preview
   */
  const syncModules = useCallback((modularPage: any) => {
    setCampaign((prev: any) => {
      const updated = {
        ...prev,
        modularPage: {
          ...modularPage,
          _updatedAt: Date.now()
        },
        design: {
          ...prev?.design,
          designModules: {
            ...modularPage,
            _updatedAt: Date.now()
          }
        },
        _syncTimestamp: Date.now()
      };
      
      console.log('🔄 [useEditorPreviewSync] Modules synced:', {
        screensCount: Object.keys(modularPage.screens || {}).length,
        totalModules: Object.values(modularPage.screens || {}).flat().length,
        timestamp: updated._syncTimestamp
      });
      
      return updated;
    });

    // Émettre un événement pour forcer le re-render du preview
    window.dispatchEvent(new CustomEvent('editor-modules-sync', { 
      detail: { modularPage, timestamp: Date.now() } 
    }));
  }, [setCampaign]);

  /**
   * Synchronise un module individuel
   */
  const syncModule = useCallback((moduleId: string, updates: any) => {
    setCampaign((prev: any) => {
      const modularPage = prev?.modularPage || { screens: { screen1: [], screen2: [], screen3: [] } };
      const updatedScreens = { ...modularPage.screens };
      
      // Trouver et mettre à jour le module dans tous les écrans
      Object.keys(updatedScreens).forEach((screenId) => {
        updatedScreens[screenId] = updatedScreens[screenId].map((m: any) => 
          m.id === moduleId ? { ...m, ...updates } : m
        );
      });

      const updated = {
        ...prev,
        modularPage: {
          screens: updatedScreens,
          _updatedAt: Date.now()
        },
        design: {
          ...prev?.design,
          designModules: {
            screens: updatedScreens,
            _updatedAt: Date.now()
          }
        },
        _syncTimestamp: Date.now()
      };
      
      console.log('🔄 [useEditorPreviewSync] Module synced:', {
        moduleId,
        updates,
        timestamp: updated._syncTimestamp
      });
      
      return updated;
    });

    // Émettre un événement pour forcer le re-render du preview
    window.dispatchEvent(new CustomEvent('editor-module-sync', { 
      detail: { moduleId, updates, timestamp: Date.now() } 
    }));
  }, [setCampaign]);

  /**
   * Synchronise les champs de formulaire entre l'éditeur et le preview
   */
  const syncFormFields = useCallback((formFields: any[]) => {
    setCampaign((prev: any) => {
      const updated = {
        ...prev,
        formFields,
        _lastUpdate: Date.now(),
        _syncTimestamp: Date.now()
      };
      
      console.log('🔄 [useEditorPreviewSync] FormFields synced:', {
        fieldsCount: formFields.length,
        fields: formFields.map(f => ({ id: f.id, label: f.label, type: f.type })),
        timestamp: updated._syncTimestamp
      });
      
      return updated;
    });

    // Émettre un événement pour forcer le re-render du preview
    window.dispatchEvent(new CustomEvent('editor-formfields-sync', { 
      detail: { formFields, timestamp: Date.now() } 
    }));
  }, [setCampaign]);

  /**
   * Obtenir la configuration canonique pour le preview
   * Cette fonction garantit que le preview utilise toujours les données les plus récentes
   */
  const getCanonicalPreviewData = useCallback(() => {
    const design = campaign?.design || {};
    const modularPage = (campaign as any)?.modularPage || (campaign?.design as any)?.designModules || { 
      screens: { screen1: [], screen2: [], screen3: [] }, 
      _updatedAt: Date.now() 
    };

    // Déterminer l'image de fond canonique
    let canonicalBackground: { type: 'color' | 'image'; value: string };
    
    // Priorité 1: canvasConfig.background (preview-only, le plus à jour)
    if ((campaign as any)?.canvasConfig?.background) {
      canonicalBackground = (campaign as any).canvasConfig.background;
    } else if (design.background && typeof design.background === 'object') {
      canonicalBackground = design.background as any;
    } else if (design.backgroundImage) {
      canonicalBackground = { type: 'image', value: design.backgroundImage };
    } else {
      canonicalBackground = { 
        type: 'color', 
        value: design.background || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' 
      };
    }

    // Récupérer les champs de formulaire canoniques
    const canonicalFormFields = (campaign as any)?.formFields || [];

    return {
      background: canonicalBackground,
      modularPage,
      formFields: canonicalFormFields,
      timestamp: (campaign as any)?._syncTimestamp || Date.now()
    };
  }, [campaign]);

  /**
   * Forcer une synchronisation complète
   */
  const forceSync = useCallback(() => {
    const syncId = `sync-${Date.now()}`;
    
    if (lastSyncRef.current === syncId) {
      return; // Éviter les boucles infinies
    }
    
    lastSyncRef.current = syncId;
    
    window.dispatchEvent(new CustomEvent('editor-force-sync', { 
      detail: { 
        campaign, 
        timestamp: Date.now(),
        syncId
      } 
    }));
    
    console.log('🔄 [useEditorPreviewSync] Force sync triggered:', syncId);
  }, [campaign]);

  return {
    syncBackground,
    syncModules,
    syncModule,
    syncFormFields,
    getCanonicalPreviewData,
    forceSync
  };
};

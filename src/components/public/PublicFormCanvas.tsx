import React, { useState, useMemo } from 'react';
import DesignCanvas from '../DesignEditor/DesignCanvas';
import type { Module } from '@/types/modularEditor';
import { useParticipations } from '@/hooks/useParticipations';

interface PublicFormCanvasProps {
  campaign: any;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

/**
 * PublicFormCanvas - Affiche le canvas de l'éditeur FormEditor en mode public
 * Utilisé pour /campaign/{id} quand type === 'form'
 * Reproduit exactement le rendu de l'onglet "Plein écran" du FormEditor
 */
const PublicFormCanvas: React.FC<PublicFormCanvasProps> = ({ campaign, previewMode = 'desktop' }) => {
  const [currentScreen] = useState<'screen1' | 'screen2'>('screen1');
  useParticipations(); // Hook called for side effects

  // Extraire les données du canvas depuis la campagne
  const modularPage = useMemo(() => {
    return (campaign.config as any)?.modularPage || { screens: { screen1: [], screen2: [] } };
  }, [campaign]);

  const canvasElements = useMemo(() => {
    return (campaign.config as any)?.canvasConfig?.elements || [];
  }, [campaign]);

  const screen1Modules: Module[] = useMemo(() => {
    return modularPage.screens?.screen1 || [];
  }, [modularPage]);

  const screen2Modules: Module[] = useMemo(() => {
    return modularPage.screens?.screen2 || [];
  }, [modularPage]);

  const activeModules = currentScreen === 'screen1' ? screen1Modules : screen2Modules;

  // Backgrounds
  const screen1Background = useMemo(() => {
    const bg = (campaign.config as any)?.canvasConfig?.screenBackgrounds?.screen1 || 
                (campaign.design as any)?.background;
    if (!bg) return { type: 'color' as const, value: '#ffffff' };
    if (typeof bg === 'string') return { type: 'color' as const, value: bg };
    return bg;
  }, [campaign]);

  const screen2Background = useMemo(() => {
    const bg = (campaign.config as any)?.canvasConfig?.screenBackgrounds?.screen2 || screen1Background;
    return bg;
  }, [campaign, screen1Background]);

  const activeBackground = currentScreen === 'screen1' ? screen1Background : screen2Background;

  // Element filter par écran
  const elementFilter = useMemo(() => {
    return (element: any) => {
      if (!element.screenId) return currentScreen === 'screen1';
      return element.screenId === currentScreen;
    };
  }, [currentScreen]);

  // Handler pour la soumission du formulaire (non utilisé actuellement)
  // const handleFormSubmit = async (data: Record<string, string>) => {
  //   console.log('📝 [PublicFormCanvas] Form submitted:', data);
  //   
  //   // Créer la participation
  //   try {
  //     if (campaign.id) {
  //       await createParticipation({
  //         campaign_id: campaign.id,
  //         form_data: data,
  //         user_email: data.email || ''
  //       });
  //     }
  //   } catch (error) {
  //     console.error('❌ [PublicFormCanvas] Error creating participation:', error);
  //   }
  //
  //   // Passer à l'écran 2
  //   setCurrentScreen('screen2');
  // };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] min-h-[100dvh] overflow-visible" style={{ backgroundColor: '#ffffff' }}>
      <style>{`
        /* Force suppression de tous les border-radius en mode public */
        .design-canvas-container,
        [data-canvas-root],
        .canvas-viewport {
          border-radius: 0 !important;
        }
        
        /* Force le conteneur principal à remplir tout l'écran */
        .design-canvas-container {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          display: flex !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
        }
        
        /* Force le canvas root à remplir l'écran */
        [data-canvas-root] {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Masquer tous les éléments d'édition */
        .design-canvas-container .grid-overlay,
        .design-canvas-container [class*="alignment"],
        .design-canvas-container [class*="guide"],
        .design-canvas-container [data-testid*="toolbar"],
        .design-canvas-container button[aria-label*="Supprimer"],
        .design-canvas-container button[aria-label*="Dupliquer"],
        .design-canvas-container button[aria-label*="Déplacer"],
        .design-canvas-container [class*="module-actions"],
        .design-canvas-container [class*="element-actions"],
        .design-canvas-container [class*="resize-handle"],
        .design-canvas-container [class*="drag-handle"],
        .design-canvas-container button[style*="position: absolute"]:not(form button):not(form *),
        .design-canvas-container button[style*="left"]:not(form button):not(form *),
        .design-canvas-container button[style*="top"]:not(form button):not(form *),
        .design-canvas-container > * > button:not(form button):not(form *),
        .design-canvas-container div > button:first-child:not(form button):not(form *),
        .design-canvas-container [class*="module"] > button:not(form button):not(form *),
        .design-canvas-container [data-module] > button:not(form button):not(form *) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* FORCER l'affichage du bouton submit du formulaire */
        .design-canvas-container form button,
        .design-canvas-container form button[type="submit"],
        .design-canvas-container button[type="submit"] {
          display: inline-flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          z-index: auto !important;
        }
        
        /* Désactiver les effets visuels de survol */
        .design-canvas-container *:hover {
          outline: none !important;
          box-shadow: none !important;
        }
        
        /* Bloquer les interactions sur les modules (sauf formulaire) */
        .design-canvas-container [class*="module"],
        .design-canvas-container [data-module],
        .design-canvas-container [class*="bloc"] {
          pointer-events: none !important;
          user-select: none !important;
        }
        
        /* Réactiver les interactions sur le formulaire */
        .design-canvas-container form,
        .design-canvas-container form *,
        .design-canvas-container input,
        .design-canvas-container textarea,
        .design-canvas-container button[type="submit"] {
          pointer-events: auto !important;
          user-select: auto !important;
        }
      `}</style>

      <DesignCanvas
        screenId={currentScreen}
        selectedDevice={previewMode}
        elements={canvasElements}
        onElementsChange={() => {}}
        background={activeBackground}
        campaign={campaign}
        onCampaignChange={() => {}}
        zoom={1}
        enableInternalAutoFit={false}
        onZoomChange={() => {}}
        selectedElement={null}
        onSelectedElementChange={() => {}}
        selectedElements={[]}
        onSelectedElementsChange={() => {}}
        onElementUpdate={() => {}}
        extractedColors={[]}
        containerClassName="!p-0 !m-0 bg-white !items-start !justify-start !pt-0 !rounded-none"
        elementFilter={elementFilter}
        onShowAnimationsPanel={() => {}}
        onShowPositionPanel={() => {}}
        onShowDesignPanel={() => {}}
        onShowEffectsPanel={() => {}}
        readOnly={true}
        modularModules={activeModules}
        onModuleUpdate={() => {}}
        onModuleDelete={() => {}}
        onModuleMove={() => {}}
        onModuleDuplicate={() => {}}
      />
    </div>
  );
};

export default PublicFormCanvas;

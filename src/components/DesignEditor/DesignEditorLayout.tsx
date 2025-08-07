import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';


import ZoomSlider from './components/ZoomSlider';
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import { useGroupManager } from '../../hooks/useGroupManager';

import KeyboardShortcutsHelp from '../shared/KeyboardShortcutsHelp';
import MobileStableEditor from './components/MobileStableEditor';


const DesignEditorLayout: React.FC = () => {
  // Détection automatique de l'appareil
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const width = window.innerWidth;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  };

  // Zoom par défaut selon l'appareil
  const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
    switch (device) {
      case 'desktop':
        return 0.7; // 70%
      case 'tablet':
        return 0.55; // 55%
      case 'mobile':
        return 0.45; // 45% pour une meilleure visibilité sur mobile
      default:
        return 0.7;
    }
  };

  // Store centralisé pour l'optimisation
  const { 
    setCampaign,
    setPreviewDevice,
    setIsLoading,
    setIsModified
  } = useEditorStore();

  // État local pour la compatibilité existante
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());

  // Gestionnaire de changement d'appareil avec ajustement automatique du zoom
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getDefaultZoom(device));
  };

  // États principaux
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
  const [canvasZoom, setCanvasZoom] = useState(getDefaultZoom(selectedDevice));
  
  // Référence pour le canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // État pour gérer l'affichage des panneaux dans la sidebar
  const [showEffectsInSidebar, setShowEffectsInSidebar] = useState(false);
  const [showAnimationsInSidebar, setShowAnimationsInSidebar] = useState(false);
  const [showPositionInSidebar, setShowPositionInSidebar] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: {
      wheelConfig: {
        scale: 2
      }
    }
  });

  // État pour l'élément sélectionné
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  
  // Fonction pour sélectionner tous les éléments (textes, images, etc.)
  const handleSelectAll = useCallback(() => {
    // Filtrer tous les éléments visibles sur le canvas (textes, images, formes, etc.)
    const selectableElements = canvasElements.filter(element => 
      element && element.id && (element.type === 'text' || element.type === 'image' || element.type === 'shape' || element.type)
    );
    
    if (selectableElements.length > 0) {
      setSelectedElements([...selectableElements]);
      setSelectedElement(null); // Désélectionner l'élément unique
      console.log('🎯 Selected all canvas elements:', {
        total: selectableElements.length,
        types: selectableElements.reduce((acc, el) => {
          acc[el.type] = (acc[el.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    } else {
      console.log('🎯 No selectable elements found on canvas');
    }
  }, [canvasElements]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showFunnel, setShowFunnel] = useState(false);



  // Ajoute à l'historique lors de l'ajout d'un nouvel élément (granulaire)
  const handleAddElement = (element: any) => {
    setCanvasElements(prev => {
      const newArr = [...prev, element];
      setTimeout(() => {
        addToHistory({
          campaignConfig: { ...campaignConfig },
          canvasElements: JSON.parse(JSON.stringify(newArr)),
          canvasBackground: { ...canvasBackground }
        }, 'element_create');
      }, 0);
      return newArr;
    });
    setSelectedElement(element);
  };

  // Ajoute à l'historique lors du changement de background (granulaire)
  const handleBackgroundChange = (bg: any) => {
    setCanvasBackground(bg);
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...campaignConfig },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...bg }
      }, 'background_update');
    }, 0);
  };

  // Ajoute à l'historique lors du changement de config (granulaire)
  const handleCampaignConfigChange = (cfg: any) => {
    setCampaignConfig(cfg);
    setTimeout(() => {
      addToHistory({
        campaignConfig: { ...cfg },
        canvasElements: JSON.parse(JSON.stringify(canvasElements)),
        canvasBackground: { ...canvasBackground }
      }, 'config_update');
    }, 0);
  };

  // Ajoute à l'historique à chaque modification d'élément (granulaire)
  const handleElementUpdate = (updates: any) => {
    if (selectedElement) {
      const updatedElement = { ...selectedElement, ...updates };
      setCanvasElements(prev => {
        const newArr = prev.map(el => el.id === selectedElement.id ? updatedElement : el);
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newArr)),
            canvasBackground: { ...canvasBackground }
          }, 'element_update');
        }, 0);
        return newArr;
      });
      setSelectedElement(updatedElement);
    }
  };

  // Utilisation du hook de synchronisation unifié
  const { wheelModalConfig } = useWheelConfigSync({
    campaign: campaignConfig,
    extractedColors,
    onCampaignChange: setCampaignConfig
  });

  // Système d'historique pour undo/redo avec le nouveau hook
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: (restoredSnapshot) => {
      console.log(' Undo: Restauration du snapshot', restoredSnapshot);
      if (restoredSnapshot) {
        // Restaure tous les sous-états à partir du snapshot
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onRedo: (restoredSnapshot) => {
      console.log(' Redo: Restauration du snapshot', restoredSnapshot);
      if (restoredSnapshot) {
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onStateChange: (state, action) => {
      console.log(` Changement d'état dans l'historique: ${action}`, state);
      setIsModified(true);
    }
  });

  // Raccourcis clavier pour undo/redo
  useUndoRedoShortcuts(undo, redo, {
    enabled: true,
    preventDefault: true
  });
  
  // Hook de gestion des groupes (après addToHistory)
  const groupManager = useGroupManager({
    elements: canvasElements,
    onElementsChange: setCanvasElements,
    onAddToHistory: addToHistory
  });
  
  const {
    createGroup,
    ungroupElements,
    selectedGroupId,
    setSelectedGroupId,
    moveGroup,
    resizeGroup,
    getGroupElements
  } = groupManager;
  
  // Fonctions pour les raccourcis clavier d'éléments
  const handleDeselectAll = useCallback(() => {
    setSelectedElement(null);
    setSelectedElements([]);
    console.log('🎯 Deselected all elements');
  }, []);
  
  const handleElementDelete = useCallback((elementId?: string) => {
    const targetElementId = elementId || selectedElement?.id;
    if (targetElementId) {
      setCanvasElements(prev => {
        const newElements = prev.filter(el => el.id !== targetElementId);
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newElements)),
            canvasBackground: { ...canvasBackground }
          }, 'element_delete');
        }, 0);
        return newElements;
      });
      setSelectedElement(null);
      console.log('🗑️ Deleted element:', targetElementId);
    } else {
      console.log('🗑️ No element to delete - selectedElement:', selectedElement);
    }
  }, [selectedElement, campaignConfig, canvasBackground, addToHistory]);
  
  const handleElementCopy = useCallback(() => {
    if (selectedElement) {
      localStorage.setItem('clipboard-element', JSON.stringify(selectedElement));
      console.log('📋 Copied element:', selectedElement.id);
    }
  }, [selectedElement]);
  
  const handleElementCut = useCallback(() => {
    if (selectedElement) {
      // D'abord copier l'élément
      localStorage.setItem('clipboard-element', JSON.stringify(selectedElement));
      console.log('✂️ Cut element (copied):', selectedElement.id);
      
      // Puis le supprimer
      const elementId = selectedElement.id;
      setCanvasElements(prev => {
        const newElements = prev.filter(el => el.id !== elementId);
        setTimeout(() => {
          addToHistory({
            campaignConfig: { ...campaignConfig },
            canvasElements: JSON.parse(JSON.stringify(newElements)),
            canvasBackground: { ...canvasBackground }
          }, 'element_cut');
        }, 0);
        return newElements;
      });
      setSelectedElement(null);
      console.log('✂️ Cut element (deleted):', elementId);
    } else {
      console.log('✂️ No element to cut - selectedElement:', selectedElement);
    }
  }, [selectedElement, campaignConfig, canvasBackground, addToHistory]);
  
  const handleElementPaste = useCallback(() => {
    try {
      const clipboardData = localStorage.getItem('clipboard-element');
      if (clipboardData) {
        const element = JSON.parse(clipboardData);
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          x: (element.x || 0) + 20,
          y: (element.y || 0) + 20
        };
        handleAddElement(newElement);
        console.log('📋 Pasted element:', newElement.id);
      }
    } catch (error) {
      console.error('Error pasting element:', error);
    }
  }, [handleAddElement]);
  
  const handleElementDuplicate = useCallback(() => {
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: `${selectedElement.type}-${Date.now()}`,
        x: (selectedElement.x || 0) + 20,
        y: (selectedElement.y || 0) + 20
      };
      handleAddElement(newElement);
      console.log('🔄 Duplicated element:', newElement.id);
    }
  }, [selectedElement, handleAddElement]);
  
  // Raccourcis clavier pour les éléments (supprimé - utilise le hook plus complet ci-dessous)

  // Synchronisation avec le store
  useEffect(() => {
    setPreviewDevice(selectedDevice);
  }, [selectedDevice, setPreviewDevice]);


  // Configuration de campagne dynamique optimisée avec synchronisation forcée
  const campaignData = useMemo(() => {
    // Extraire les éléments du canvas selon leur type et rôle
    const titleElement = canvasElements.find(el => el.type === 'text' && el.role === 'title');
    const descriptionElement = canvasElements.find(el => el.type === 'text' && el.role === 'description');
    const buttonElement = canvasElements.find(el => el.type === 'text' && el.role === 'button');
    
    // Séparer les textes et images personnalisés des éléments UI
    const customTexts = canvasElements.filter(el => 
      el.type === 'text' && !['title', 'description', 'button'].includes(el.role)
    );
    const customImages = canvasElements.filter(el => el.type === 'image');

    // Configuration de la roue avec priorité absolue aux modifications en cours
    const currentWheelConfig = {
      borderStyle: wheelModalConfig?.wheelBorderStyle || campaignConfig?.wheelConfig?.borderStyle || campaignConfig?.design?.wheelBorderStyle || 'classic',
      borderColor: wheelModalConfig?.wheelBorderColor || campaignConfig?.wheelConfig?.borderColor || campaignConfig?.design?.wheelConfig?.borderColor || '#841b60',
      scale: wheelModalConfig?.wheelScale !== undefined ? wheelModalConfig.wheelScale : (campaignConfig?.wheelConfig?.scale !== undefined ? campaignConfig.wheelConfig.scale : (campaignConfig?.design?.wheelConfig?.scale || 1))
    };

    console.log('🔄 CampaignData wheel config sync:', {
      wheelModalConfigScale: wheelModalConfig?.wheelScale,
      campaignConfigScale: campaignConfig?.wheelConfig?.scale,
      finalScale: currentWheelConfig.scale,
      showFunnel
    });

    return {
      id: 'wheel-design-preview',
      type: 'wheel',
      design: {
        background: canvasBackground,
        customTexts: customTexts,
        customImages: customImages,
        extractedColors: extractedColors,
        customColors: {
          primary: extractedColors[0] || campaignConfig.buttonColor || '#841b60',
          secondary: extractedColors[1] || '#4ecdc4',
          accent: extractedColors[2] || '#45b7d1'
        },
        wheelConfig: currentWheelConfig,
        wheelBorderStyle: currentWheelConfig.borderStyle
      },
      gameConfig: {
        wheel: {
          segments: [
            { id: '1', label: 'Prix 1', color: extractedColors[0] || '#841b60', probability: 0.25, isWinning: true },
            { id: '2', label: 'Prix 2', color: extractedColors[1] || '#4ecdc4', probability: 0.25, isWinning: true },
            { id: '3', label: 'Prix 3', color: extractedColors[0] || '#841b60', probability: 0.25, isWinning: true },
            { id: '4', label: 'Dommage', color: extractedColors[1] || '#4ecdc4', probability: 0.25, isWinning: false }
          ],
          winProbability: 0.75,
          maxWinners: 100,
          buttonLabel: buttonElement?.content || 'Faire tourner'
        }
      },
      buttonConfig: {
        text: buttonElement?.content || 'Faire tourner',
        color: extractedColors[0] || campaignConfig.buttonColor || '#841b60',
        textColor: buttonElement?.style?.color || '#ffffff',
        borderRadius: campaignConfig.borderRadius || '8px'
      },
      screens: [
        {
          title: titleElement?.content || 'Tentez votre chance !',
          description: descriptionElement?.content || 'Tournez la roue et gagnez des prix incroyables',
          buttonText: buttonElement?.content || 'Jouer'
        }
      ],
      formFields: [
        { id: 'prenom', label: 'Prénom', type: 'text', required: true },
        { id: 'nom', label: 'Nom', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true }
      ],
      // Garder la configuration canvas pour compatibilité
      canvasConfig: {
        elements: canvasElements,
        background: canvasBackground,
        device: selectedDevice
      }
    };
  }, [canvasElements, canvasBackground, campaignConfig, extractedColors, selectedDevice, wheelModalConfig]);




  // Synchronisation avec le store
  useEffect(() => {
    if (campaignData) {
      const transformedCampaign = {
        ...campaignData,
        name: 'Ma Campagne',
        type: (campaignData.type || 'wheel') as 'wheel' | 'scratch' | 'jackpot' | 'quiz' | 'dice' | 'form' | 'memory' | 'puzzle',
        design: {
          ...campaignData.design,
          background: typeof campaignData.design?.background === 'object' 
            ? campaignData.design.background.value || '#ffffff'
            : campaignData.design?.background || '#ffffff'
        }
      };
      setCampaign(transformedCampaign);
    }
  }, [campaignData, setCampaign]);

  // Actions optimisées
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsModified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setShowFunnel(!showFunnel);
  };

  // Fonction pour appliquer les couleurs extraites à la roue
  const handleExtractedColorsChange = (colors: string[]) => {
    setExtractedColors(colors);
    
    // Appliquer automatiquement la couleur extraite (dominante) et le blanc comme seconde couleur
    if (colors.length >= 1) {
      setCampaignConfig((prev: any) => {
        const currentWheelConfig = prev?.design?.wheelConfig;
        const isClassicBorder = (currentWheelConfig?.borderStyle || 'classic') === 'classic';
        
        // Ne mettre à jour la couleur de bordure que si :
        // 1. Le style est "classic" ET
        // 2. L'utilisateur n'a pas déjà configuré manuellement une couleur personnalisée différente de la couleur par défaut
        const shouldUpdateBorderColor = isClassicBorder && 
          (!currentWheelConfig?.borderColor || currentWheelConfig.borderColor === '#841b60');
        
        return {
          ...prev,
          design: {
            ...prev?.design,
            wheelConfig: {
              ...currentWheelConfig,
              ...(shouldUpdateBorderColor && {
                borderColor: colors[0] || '#841b60'
              })
            },
            brandColors: {
              primary: colors[0] || '#841b60',
              secondary: '#ffffff', // Blanc par défaut pour la seconde couleur
              accent: colors[0] || '#45b7d1'
            }
          }
        };
      });
    }
  };

  // Raccourcis clavier professionnels
  const { shortcuts } = useKeyboardShortcuts({
    selectedElement,
    onSave: () => {
      handleSave();
    },
    onPreview: () => {
      handlePreview();
    },
    onUndo: () => {
      undo();
    },
    onRedo: () => {
      redo();
    },
    onZoomIn: () => {
      setCanvasZoom(prev => Math.min(prev + 0.1, 3));
    },
    onZoomOut: () => {
      setCanvasZoom(prev => Math.max(prev - 0.1, 0.25));
    },
    onZoomReset: () => {
      setCanvasZoom(1);
    },
    onZoomFit: () => {
      setCanvasZoom(1);
    },
    onSelectAll: handleSelectAll,
    onDeselectAll: handleDeselectAll,
    onElementDelete: handleElementDelete,
    onElementCopy: handleElementCopy,
    onElementCut: handleElementCut,
    onElementPaste: handleElementPaste,
    onDuplicate: handleElementDuplicate,
    // Raccourcis pour les groupes niveau Canva (inspiré de TestPage2)
    onGroup: () => {
      console.log('🎯 🔥 GROUP FUNCTION CALLED!');
      console.log('🎯 Selected elements:', selectedElements);
      console.log('🎯 Selected elements length:', selectedElements?.length);
      
      // Filtrer uniquement les éléments (pas les groupes) pour le groupement
      const validElements = selectedElements.filter(el => el && !el.isGroup && el.type !== 'group');
      
      if (validElements.length >= 2) {
        console.log('🎯 ✅ Conditions met, creating group with', validElements.length, 'elements');
        const elementIds = validElements.map(el => el.id);
        console.log('🎯 Element IDs to group:', elementIds);
        
        const groupId = createGroup(elementIds, `Groupe ${Date.now()}`);
        console.log('🎯 Group created with ID:', groupId);
        
        if (groupId) {
          // Ajouter à l'historique avec le nouvel état
          addToHistory({
            canvasElements: [...canvasElements],
            canvasBackground: { ...canvasBackground },
            campaignConfig: { ...campaignConfig },
            selectedElements: [],
            selectedGroupId: groupId
          });
          
          // Mettre à jour la sélection
          setSelectedElements([]);
          setSelectedElement(null);
          setSelectedGroupId(groupId);
          
          console.log('🎯 ✅ Group created successfully!');
        }
      } else {
        console.log('🎯 ❌ Need at least 2 elements to create a group. Found:', validElements.length);
      }
    },
    onUngroup: () => {
      console.log('🎯 Ungrouping selected group:', selectedGroupId);
      
      // Vérifier s'il y a un groupe sélectionné ou des groupes dans la sélection
      let targetGroupId = selectedGroupId;
      
      if (!targetGroupId && selectedElements.length > 0) {
        // Chercher un groupe dans les éléments sélectionnés
        const selectedGroup = selectedElements.find(el => el.isGroup || el.type === 'group');
        if (selectedGroup) {
          targetGroupId = selectedGroup.id;
        }
      }
      
      if (targetGroupId) {
        console.log('🎯 Dissociating group:', targetGroupId);
        
        // Récupérer les éléments du groupe avant de le dissocier
        const groupElements = getGroupElements(targetGroupId);
        console.log('🎯 Group elements to liberate:', groupElements.map(el => el.id));
        
        // Dissocier le groupe
        ungroupElements(targetGroupId);
        
        // Ajouter à l'historique
        addToHistory({
          canvasElements: [...canvasElements],
          canvasBackground: { ...canvasBackground },
          campaignConfig: { ...campaignConfig },
          selectedElements: groupElements,
          selectedGroupId: null
        });
        
        // Sélectionner les éléments libérés
        setSelectedElements(groupElements);
        setSelectedElement(null);
        setSelectedGroupId(null);
        
        console.log('🎯 ✅ Group ungrouped successfully!');
      } else {
        console.log('🎯 ❌ No group selected to ungroup');
      }
    }
  });

  // Auto-responsive logic



  return (
    <MobileStableEditor className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar - Hidden in preview mode */}
      {!showFunnel && (
        <>
          <DesignToolbar 
            selectedDevice={selectedDevice}
            onDeviceChange={handleDeviceChange}
            onPreviewToggle={handlePreview}
            isPreviewMode={showFunnel}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          
          {/* Bouton d'aide des raccourcis clavier */}
          <div className="absolute top-4 right-4 z-10">
            <KeyboardShortcutsHelp shortcuts={shortcuts} />
          </div>
        </>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {showFunnel ? (
          /* Funnel Preview Mode */
          <div className={`flex-1 flex items-center justify-center bg-gray-100 group ${
            selectedDevice === 'tablet' ? 'fixed inset-0 z-40' : ''
          }`}>
            {/* Floating Edit Mode Button */}
            <button
              onClick={() => setShowFunnel(false)}
              className="absolute top-4 right-4 z-50 px-4 py-2 bg-[#841b60] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#6b1549]"
            >
              Mode édition
            </button>
            <FunnelUnlockedGame
              campaign={campaignData}
              previewMode={selectedDevice}
              wheelModalConfig={wheelModalConfig}
            />
          </div>
        ) : (
          /* Design Editor Mode */
          <>
            {/* Hybrid Sidebar - Design & Technical */}
            <HybridSidebar 
              onAddElement={handleAddElement}
              onBackgroundChange={handleBackgroundChange}
              onExtractedColorsChange={handleExtractedColorsChange}
              campaignConfig={campaignConfig}
              onCampaignConfigChange={handleCampaignConfigChange}
              elements={canvasElements}
              onElementsChange={setCanvasElements}
              selectedElement={selectedElement}
              onElementUpdate={handleElementUpdate}
              showEffectsPanel={showEffectsInSidebar}
              onEffectsPanelChange={setShowEffectsInSidebar}
              showAnimationsPanel={showAnimationsInSidebar}
              onAnimationsPanelChange={setShowAnimationsInSidebar}
              showPositionPanel={showPositionInSidebar}
              onPositionPanelChange={setShowPositionInSidebar}
              canvasRef={canvasRef}
              selectedElements={selectedElements}
              onSelectedElementsChange={setSelectedElements}
              onAddToHistory={addToHistory}
            />
            
            {/* Main Canvas Area */}
            <DesignCanvas 
              selectedDevice={selectedDevice}
              elements={canvasElements}
              onElementsChange={setCanvasElements}
              background={canvasBackground}
              campaign={campaignConfig}
              onCampaignChange={handleCampaignConfigChange}
              zoom={canvasZoom}
              onZoomChange={setCanvasZoom}
              selectedElement={selectedElement}
              onSelectedElementChange={setSelectedElement}
              selectedElements={selectedElements}
              onSelectedElementsChange={setSelectedElements}
              onElementUpdate={handleElementUpdate}
              // Props pour le système de groupes niveau Canva
              selectedGroupId={selectedGroupId || undefined}
              onSelectedGroupChange={setSelectedGroupId}
              groups={groupManager.groups}
              onGroupMove={moveGroup}
              onGroupResize={resizeGroup}

              onShowEffectsPanel={() => {
                setShowEffectsInSidebar(true);
                setShowAnimationsInSidebar(false);
              }}
              onShowAnimationsPanel={() => {
                setShowAnimationsInSidebar(true);
                setShowEffectsInSidebar(false);
                setShowPositionInSidebar(false);
              }}
              onShowPositionPanel={() => {
                setShowPositionInSidebar(true);
                setShowEffectsInSidebar(false);
                setShowAnimationsInSidebar(false);
              }}
              // Props pour la sidebar mobile
              onAddElement={handleAddElement}
              onBackgroundChange={handleBackgroundChange}
              onExtractedColorsChange={handleExtractedColorsChange}
              // Props pour la toolbar mobile
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            
            {/* Auto-Responsive Indicator - Always visible in bottom right */}

            
            {/* Zoom Slider - Always visible in bottom center */}
            <ZoomSlider 
              zoom={canvasZoom}
              onZoomChange={setCanvasZoom}
              minZoom={0.25}
              maxZoom={3}
              step={0.05}
            />
          </>
        )}
      </div>
      
      {/* Performance Monitor */}

    </MobileStableEditor>
  );
};

export default DesignEditorLayout;
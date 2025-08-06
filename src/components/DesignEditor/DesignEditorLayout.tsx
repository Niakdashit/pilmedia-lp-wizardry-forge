import React, { useState, useMemo, useEffect, useRef } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';


import ZoomSlider from './components/ZoomSlider';
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';

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
        return 0.65; // 65%
      case 'mobile':
        return 0.95; // 95%
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
              selectedElement={selectedElement}
              onSelectedElementChange={setSelectedElement}
              onElementUpdate={handleElementUpdate}

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
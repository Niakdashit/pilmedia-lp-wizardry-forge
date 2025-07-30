import React, { useState, useMemo, useEffect } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import AutoResponsiveIndicator from './components/AutoResponsiveIndicator';
import ZoomSlider from './components/ZoomSlider';
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useHistoryManager } from '../ModernEditor/hooks/useHistoryManager';
import PerformanceMonitor from '../ModernEditor/components/PerformanceMonitor';
import { useDebouncedCallback } from 'use-debounce';

const DesignEditorLayout: React.FC = () => {
  // Détection automatique de l'appareil
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const width = window.innerWidth;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
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
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
  const [campaignConfig, setCampaignConfig] = useState<any>({});
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showFunnel, setShowFunnel] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);

  // Système d'historique pour undo/redo
  const { addToHistory, undo, redo } = useHistoryManager({
    maxHistorySize: 50,
    onUndo: (restoredCampaign) => {
      if (restoredCampaign) {
        setCampaign(restoredCampaign);
      }
    },
    onRedo: (restoredCampaign) => {
      if (restoredCampaign) {
        setCampaign(restoredCampaign);
      }
    }
  });

  // Synchronisation avec le store
  useEffect(() => {
    setPreviewDevice(selectedDevice);
  }, [selectedDevice, setPreviewDevice]);


  // Configuration de campagne dynamique optimisée
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
        wheelConfig: {
          borderStyle: campaignConfig.wheelConfig?.borderStyle || 'classic',
          borderColor: campaignConfig.wheelConfig?.borderColor || '#841b60',
          scale: campaignConfig.wheelConfig?.scale || 1
        },
        wheelBorderStyle: campaignConfig.wheelConfig?.borderStyle || 'classic'
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
  }, [canvasElements, canvasBackground, campaignConfig, extractedColors, selectedDevice]);

  // Debounced history update pour éviter trop d'entrées
  const debouncedAddToHistory = useDebouncedCallback((data: any) => {
    addToHistory(data, 'canvas_update');
  }, 300);

  // Synchronisation avec le store et historique
  useEffect(() => {
    setCampaign(campaignData);
    debouncedAddToHistory(campaignData);
  }, [campaignData, setCampaign, debouncedAddToHistory]);

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
  useKeyboardShortcuts({
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
    }
  });

  // Auto-responsive logic
  const { getAdaptationSuggestions } = useAutoResponsive('desktop');
  
  const adaptationSuggestions = useMemo(() => {
    return getAdaptationSuggestions(canvasElements);
  }, [canvasElements, getAdaptationSuggestions]);


  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar - Hidden in preview mode */}
      {!showFunnel && (
        <DesignToolbar 
          selectedDevice={selectedDevice}
          onDeviceChange={setSelectedDevice}
          onPreviewToggle={handlePreview}
          isPreviewMode={showFunnel}
        />
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
            />
          </div>
        ) : (
          /* Design Editor Mode */
          <>
            {/* Hybrid Sidebar - Design & Technical */}
            <HybridSidebar 
              onAddElement={(element) => setCanvasElements(prev => [...prev, element])}
              onBackgroundChange={setCanvasBackground}
              onExtractedColorsChange={handleExtractedColorsChange}
              campaignConfig={campaignConfig}
              onCampaignConfigChange={setCampaignConfig}
              elements={canvasElements}
              onElementsChange={setCanvasElements}
            />
            
            {/* Main Canvas Area */}
            <DesignCanvas 
              selectedDevice={selectedDevice}
              elements={canvasElements}
              onElementsChange={setCanvasElements}
              background={canvasBackground}
              campaign={campaignConfig}
              onCampaignChange={setCampaignConfig}
              zoom={canvasZoom}
            />
            
            {/* Auto-Responsive Indicator - Always visible in bottom right */}
            <AutoResponsiveIndicator adaptationSuggestions={adaptationSuggestions} />
            
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
      <PerformanceMonitor />
    </div>
  );
};

export default DesignEditorLayout;
import React, { useState, useMemo } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import AutoResponsiveIndicator from './components/AutoResponsiveIndicator';
import ZoomSlider from './components/ZoomSlider';

const DesignEditorLayout: React.FC = () => {
  // Intelligent device selection - desktop for editing, tablet/mobile for preview
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
  const [campaignConfig, setCampaignConfig] = useState<any>({});
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showFunnel, setShowFunnel] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);

  // Fonction pour appliquer les couleurs extraites à la roue
  const handleExtractedColorsChange = (colors: string[]) => {
    setExtractedColors(colors);
    
    // Appliquer automatiquement la couleur extraite (dominante) et le blanc comme seconde couleur
    if (colors.length >= 1) {
      setCampaignConfig((prev: any) => ({
        ...prev,
        design: {
          ...prev?.design,
          wheelConfig: {
            ...prev?.design?.wheelConfig,
            borderColor: colors[0] || '#841b60'
          },
          brandColors: {
            primary: colors[0] || '#841b60',
            secondary: '#ffffff', // Blanc par défaut pour la seconde couleur
            accent: colors[0] || '#45b7d1'
          }
        }
      }));
    }
  };

  // Auto-responsive logic
  const { getAdaptationSuggestions } = useAutoResponsive('desktop');
  
  const adaptationSuggestions = useMemo(() => {
    return getAdaptationSuggestions(canvasElements);
  }, [canvasElements, getAdaptationSuggestions]);

  // Configuration de campagne dynamique basée sur les éléments du canvas
  const generateCampaignFromCanvas = () => {
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
        wheelConfig: campaignConfig.wheelConfig || {
          borderStyle: 'classic',
          borderColor: '#841b60',
          scale: 1
        }
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
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar - Hidden in preview mode */}
      {!showFunnel && (
        <DesignToolbar 
          selectedDevice={selectedDevice}
          onDeviceChange={setSelectedDevice}
          onPreviewToggle={() => setShowFunnel(!showFunnel)}
          isPreviewMode={showFunnel}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {showFunnel ? (
          /* Funnel Preview Mode */
          <div className="flex-1 flex items-center justify-center bg-gray-100 group">
            {/* Floating Edit Mode Button */}
            <button
              onClick={() => setShowFunnel(false)}
              className="absolute top-4 right-4 z-50 px-4 py-2 bg-[#841b60] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#6b1549]"
            >
              Mode édition
            </button>
            {/* Device-specific preview container */}
            <div className={`
              ${selectedDevice === 'desktop' ? 'max-w-[810px] w-full' : ''}
              ${selectedDevice === 'tablet' ? 'w-[768px] h-[1024px] bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden' : ''}
              ${selectedDevice === 'mobile' ? 'w-[375px] h-[812px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-gray-800 overflow-hidden relative' : ''}
              transition-all duration-300 ease-in-out
            `}>
              {selectedDevice === 'mobile' && (
                <>
                  {/* Mobile notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10"></div>
                  {/* Mobile home indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
                </>
              )}
              
              <div className={`
                w-full h-full
                ${selectedDevice === 'mobile' ? 'pt-6 pb-4' : ''}
                ${selectedDevice === 'tablet' ? 'p-2' : ''}
              `}>
                <FunnelUnlockedGame
                  campaign={generateCampaignFromCanvas()}
                  previewMode={selectedDevice}
                />
              </div>
            </div>
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
    </div>
  );
};

export default DesignEditorLayout;
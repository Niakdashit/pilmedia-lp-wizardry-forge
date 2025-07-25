import React, { useState } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';

const DesignEditorLayout: React.FC = () => {
  // Détection automatique de l'appareil
  const detectDevice = () => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTablet = /ipad|android(?!.*mobile)|tablet/.test(userAgent) || 
                      (window.innerWidth >= 768 && window.innerWidth <= 1024);
      const isMobile = window.innerWidth < 768 && !/ipad|tablet/.test(userAgent);
      
      if (isTablet) return 'tablet';
      if (isMobile) return 'mobile';
      return 'desktop';
    }
    return 'mobile';
  };

  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
  const [extractedColors, setExtractedColors] = useState<{ primary: string; secondary: string; accent: string } | null>(null);
  const [campaignConfig, setCampaignConfig] = useState<any>({});
  const [showFunnel, setShowFunnel] = useState(false);

  // Configuration de campagne dynamique basée sur les éléments du canvas
  const generateCampaignFromCanvas = () => {
    // Extraire les textes depuis les éléments canvas
    const titleElement = canvasElements.find(el => el.type === 'text' && el.role === 'title');
    const descriptionElement = canvasElements.find(el => el.type === 'text' && el.role === 'description');
    const buttonElement = canvasElements.find(el => el.type === 'text' && el.role === 'button');

    return {
      id: 'wheel-design-preview',
      type: 'wheel',
      design: {
        buttonColor: campaignConfig.buttonColor || '#841b60',
        borderRadius: campaignConfig.borderRadius || '8px',
        background: canvasBackground,
        customElements: canvasElements,
        extractedColors, // Ajouter les couleurs extraites
        textStyles: {
          title: { 
            color: titleElement?.style?.color || '#333333', 
            fontSize: titleElement?.style?.fontSize || '24px', 
            fontWeight: 'bold' 
          },
          description: {
            color: descriptionElement?.style?.color || '#666666',
            fontSize: descriptionElement?.style?.fontSize || '16px'
          },
          button: { 
            color: buttonElement?.style?.color || '#ffffff' 
          }
        }
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
      canvasConfig: {
        elements: canvasElements,
        background: canvasBackground,
        device: selectedDevice
      }
    };
  };

  const handleColorsExtracted = (colors: { primary: string; secondary: string; accent: string }) => {
    console.log('🎨 Couleurs extraites reçues dans DesignEditorLayout:', colors);
    setExtractedColors(colors);
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
            <FunnelUnlockedGame
              campaign={generateCampaignFromCanvas()}
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
              onColorsExtracted={handleColorsExtracted}
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
              extractedColors={extractedColors}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DesignEditorLayout;
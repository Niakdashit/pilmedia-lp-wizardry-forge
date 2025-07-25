import React, { useState } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';

const DesignEditorLayout: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar */}
      <DesignToolbar 
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        onPreviewToggle={() => setShowFunnel(!showFunnel)}
        isPreviewMode={showFunnel}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showFunnel ? (
          /* Funnel Preview Mode */
          <div className="flex-1 flex items-center justify-center bg-gray-100">
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
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DesignEditorLayout;
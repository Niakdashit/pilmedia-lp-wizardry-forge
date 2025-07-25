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

  // Configuration de campagne par défaut pour la roue (unlocked game)
  const mockCampaign = {
    id: 'wheel-design-preview',
    type: 'wheel',
    design: {
      buttonColor: '#841b60',
      borderRadius: '8px',
      textStyles: {
        title: { color: '#333333', fontSize: '24px', fontWeight: 'bold' },
        button: { color: '#ffffff' }
      }
    },
    screens: [
      {
        title: 'Tentez votre chance !',
        description: 'Tournez la roue et gagnez des prix incroyables',
        buttonText: 'Jouer'
      }
    ],
    formFields: [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ]
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar */}
      <DesignToolbar 
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
      />
      
      {/* Toggle Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <button
          onClick={() => setShowFunnel(!showFunnel)}
          className="px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors"
        >
          {showFunnel ? 'Mode Édition' : 'Aperçu Funnel'}
        </button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showFunnel ? (
          /* Funnel Preview Mode */
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <FunnelUnlockedGame
              campaign={mockCampaign}
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
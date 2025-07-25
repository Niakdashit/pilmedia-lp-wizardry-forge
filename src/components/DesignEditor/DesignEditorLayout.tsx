import React, { useState } from 'react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';

const DesignEditorLayout: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
  const [campaignConfig, setCampaignConfig] = useState<any>({});

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar */}
      <DesignToolbar 
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
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
      </div>
    </div>
  );
};

export default DesignEditorLayout;
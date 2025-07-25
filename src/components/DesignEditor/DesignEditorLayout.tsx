import React, { useState } from 'react';
import TechnicalSidebar from './TechnicalSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';

const DesignEditorLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('campaign');
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
  const [campaignConfig, setCampaignConfig] = useState<any>({});
  
  // Keep setCanvasBackground for future canvas background configuration
  console.log('Background setter available:', typeof setCanvasBackground);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar */}
      <DesignToolbar 
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Technical Configuration */}
        <TechnicalSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          campaignConfig={campaignConfig}
          onCampaignConfigChange={setCampaignConfig}
        />
        
        {/* Note: setCanvasBackground will be used later for canvas background configuration */}
        
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
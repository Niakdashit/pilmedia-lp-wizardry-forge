import React, { useState } from 'react';
import DesignSidebar from './DesignSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';

const DesignEditorLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('design');
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar */}
      <DesignToolbar 
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <DesignSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddElement={(element) => setCanvasElements(prev => [...prev, element])}
          onBackgroundChange={setCanvasBackground}
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
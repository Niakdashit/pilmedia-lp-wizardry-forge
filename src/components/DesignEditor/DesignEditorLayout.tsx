import React, { useState } from 'react';
import DesignSidebar from './DesignSidebar';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';

const DesignEditorLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('design');
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);

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
        />
        
        {/* Main Canvas Area */}
        <DesignCanvas 
          selectedDevice={selectedDevice}
          elements={canvasElements}
          onElementsChange={setCanvasElements}
        />
      </div>
    </div>
  );
};

export default DesignEditorLayout;
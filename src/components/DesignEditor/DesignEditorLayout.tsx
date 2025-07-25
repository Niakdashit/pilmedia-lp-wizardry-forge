import React, { useState, useEffect } from 'react';
import DesignCanvas from './DesignCanvas';
import DesignSidebar from './DesignSidebar';
import { useEditorHistory } from './hooks/useEditorHistory';
import { useMultiSelection } from './hooks/useMultiSelection';

const DesignEditorLayout: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [elements, setElements] = useState<any[]>([]);
  const [background, setBackground] = useState<{
    type: 'color' | 'image';
    value: string;
  }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });

  const { saveState, undo, redo, canUndo, canRedo } = useEditorHistory(elements, setElements);
  const { selectedElements, selectElement, clearSelection } = useMultiSelection();

  // Save state when elements change
  useEffect(() => {
    if (elements.length > 0) {
      saveState(elements);
    }
  }, [elements, saveState]);

  const getCanvasSize = () => {
    switch (selectedDevice) {
      case 'desktop':
        return { width: 1920, height: 1080 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'mobile':
        return { width: 375, height: 667 };
      default:
        return { width: 375, height: 667 };
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Clear selection when clicking on empty canvas area
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Toolbar with Device Selector */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-center items-center gap-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
            <button
              key={device}
              onClick={() => setSelectedDevice(device)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                selectedDevice === device 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablette' : 'Mobile'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <DesignSidebar 
          selectedDevice={selectedDevice}
          elements={elements}
          onElementsChange={setElements}
          background={background}
          onBackgroundChange={setBackground}
          selectedElements={selectedElements}
          onElementSelect={selectElement}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          canvasSize={getCanvasSize()}
        />
        
        {/* Main Canvas Area */}
        <DesignCanvas 
          selectedDevice={selectedDevice}
          elements={elements}
          onElementsChange={setElements}
          background={background}
          selectedElements={selectedElements}
          onElementSelect={selectElement}
          onCanvasClick={handleCanvasClick}
        />
      </div>
    </div>
  );
};

export default DesignEditorLayout;
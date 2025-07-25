import React, { useState, useEffect } from 'react';
import DesignCanvas from './DesignCanvas';
import DesignSidebar from './DesignSidebar';
import FormatToolbar from './components/FormatToolbar';
import ActionButtons from './components/ActionButtons';
import { useEditorHistory } from './hooks/useEditorHistory';
import { useMultiSelection } from './hooks/useMultiSelection';

const DesignEditorLayout: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [elements, setElements] = useState<any[]>([]);
  const [background] = useState<{
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


  const handleCanvasClick = (e: React.MouseEvent) => {
    // Clear selection when clicking on empty canvas area
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
      <DesignSidebar 
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Format Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-center">
          <FormatToolbar selectedElements={selectedElements} />
        </div>
        
        {/* Canvas Container */}
        <div className="flex-1 relative bg-gray-100 flex items-center justify-center p-8">
          {/* Device Frame */}
          <div className={`relative bg-white rounded-lg shadow-lg ${
            selectedDevice === 'desktop' ? 'w-full max-w-6xl h-full max-h-[800px]' :
            selectedDevice === 'tablet' ? 'w-[768px] h-[1024px]' :
            'w-[375px] h-[667px]'
          }`}>
            {/* Device selector tabs */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex bg-gray-100 rounded-lg p-1">
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
        
        {/* Bottom Action Buttons */}
        <div className="bg-white border-t border-gray-200 p-4 flex justify-end">
          <ActionButtons 
            onPreview={() => console.log('Preview')}
            onSave={() => console.log('Save')}
            onExport={() => console.log('Export')}
          />
        </div>
      </div>
    </div>
  );
};

export default DesignEditorLayout;
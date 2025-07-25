import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import CanvasToolbar from './CanvasToolbar';
interface DesignCanvasProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  selectedElements: string[];
  onElementSelect: (id: string, isCtrlPressed?: boolean) => void;
  onCanvasClick: (e: React.MouseEvent) => void;
}
const DesignCanvas: React.FC<DesignCanvasProps> = ({
  selectedDevice,
  elements,
  onElementsChange,
  background,
  selectedElements,
  onElementSelect,
  onCanvasClick
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const getCanvasSize = () => {
    switch (selectedDevice) {
      case 'desktop':
        return {
          width: 1920,
          height: 1080
        };
      // 16:9 ratio
      case 'tablet':
        return {
          width: 768,
          height: 1024
        };
      case 'mobile':
        return {
          width: 375,
          height: 667
        };
      default:
        return {
          width: 375,
          height: 667
        };
    }
  };
  const canvasSize = getCanvasSize();
  const handleElementUpdate = (id: string, updates: any) => {
    onElementsChange(elements.map(el => el.id === id ? {
      ...el,
      ...updates
    } : el));
  };
  const handleElementDelete = (id: string) => {
    onElementsChange(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };
  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  // Sync local selection with global selection
  React.useEffect(() => {
    if (selectedElements.length === 1) {
      setSelectedElement(selectedElements[0]);
    } else {
      setSelectedElement(null);
    }
  }, [selectedElements]);
  return <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-gray-100 p-8 overflow-auto">
        {/* Canvas Toolbar - Only show when text element is selected */}
        {selectedElementData && selectedElementData.type === 'text' && <div className="flex justify-center mb-4">
            <CanvasToolbar selectedElement={selectedElementData} onElementUpdate={updates => selectedElement && handleElementUpdate(selectedElement, updates)} />
          </div>}
        
        <div className="flex justify-center">
          <div 
            className="relative bg-white shadow-lg rounded-lg overflow-hidden" 
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              transform: selectedDevice === 'desktop' ? 'scale(0.5)' : selectedDevice === 'tablet' ? 'scale(0.8)' : 'scale(1)',
              transformOrigin: 'top center'
            }}
            onClick={onCanvasClick}
          >
            {/* Canvas Background */}
            <div className="absolute inset-0" style={{
            background: background?.type === 'image' ? `url(${background.value}) center/cover no-repeat` : background?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
          }}>
              {/* Clouds */}
              
              
              
              
              
              {/* Default content when no elements */}
              {elements.length === 0 && <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center">
                  <h2 className="text-white text-3xl font-bold mb-4 drop-shadow-lg">Jouez pour gagner</h2>
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-20 h-20 bg-white rounded-full"></div>
                  </div>
                </div>}
            </div>

            {/* Canvas Elements */}
            {elements
              .filter(element => element.visible !== false)
              .map(element => 
                <CanvasElement 
                  key={element.id} 
                  element={element} 
                  isSelected={selectedElements.includes(element.id)}
                  isMultiSelected={selectedElements.length > 1 && selectedElements.includes(element.id)}
                  onSelect={(isCtrlPressed) => onElementSelect(element.id, isCtrlPressed)} 
                  onUpdate={updates => handleElementUpdate(element.id, updates)} 
                  onDelete={() => handleElementDelete(element.id)} 
                />
              )}

            {/* Device Frame for mobile/tablet */}
            {selectedDevice !== 'desktop' && <div className="absolute inset-0 pointer-events-none">
                {selectedDevice === 'mobile' && <>
                    {/* iPhone-like frame */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-black rounded-full"></div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded-full"></div>
                  </>}
                {selectedDevice === 'tablet' && <>
                    {/* Tablet-like frame */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                  </>}
              </div>}
          </div>
        </div>

        {/* Canvas Info */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {selectedDevice} • {canvasSize.width} × {canvasSize.height}px
        </div>
      </div>
    </DndProvider>;
};
export default DesignCanvas;
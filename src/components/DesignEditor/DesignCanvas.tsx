import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import { SmartWheel } from '../SmartWheel';
import WheelConfigModal from './WheelConfigModal';
interface DesignCanvasProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: {
    type: 'color' | 'image';
    value: string;
  };
}
const DesignCanvas: React.FC<DesignCanvasProps> = ({
  selectedDevice,
  elements,
  onElementsChange,
  background
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showBorderModal, setShowBorderModal] = useState(false);
  const [wheelBorderStyle, setWheelBorderStyle] = useState('classic');
  const [wheelBorderColor, setWheelBorderColor] = useState('#841b60');
  const [wheelScale, setWheelScale] = useState(1);
  const getCanvasSize = () => {
    switch (selectedDevice) {
      case 'desktop':
        return {
          width: 1200,
          height: 675
        };
      // 16:9 ratio
      case 'tablet':
        return {
          width: 768,
          height: 1024
        };
      // 3:4 ratio (portrait)
      case 'mobile':
        return {
          width: 360,
          height: 640
        };
      // 9:16 ratio (portrait)
      default:
        return {
          width: 360,
          height: 640
        };
      // 9:16 ratio (portrait)
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

  // Définir la taille de la roue en fonction de l'appareil et du scale
  const getWheelSize = () => {
    const baseSize = (() => {
      switch (selectedDevice) {
        case 'desktop':
          return 200;
        case 'tablet':
          return 180;
        case 'mobile':
          return 140;
        default:
          return 140;
      }
    })();
    return Math.round(baseSize * wheelScale);
  };

  // Segments par défaut pour la roue
  const wheelSegments = [
    { id: '1', label: '10€', color: '#ff6b6b', textColor: '#ffffff' },
    { id: '2', label: '20€', color: '#4ecdc4', textColor: '#ffffff' },
    { id: '3', label: '5€', color: '#45b7d1', textColor: '#ffffff' },
    { id: '4', label: 'Perdu', color: '#96ceb4', textColor: '#ffffff' },
    { id: '5', label: '50€', color: '#feca57', textColor: '#ffffff' },
    { id: '6', label: '30€', color: '#ff9ff3', textColor: '#ffffff' }
  ];
  return <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-gray-100 p-8 overflow-auto">
        {/* Canvas Toolbar - Only show when text element is selected */}
        {selectedElementData && selectedElementData.type === 'text' && <div className="flex justify-center mb-4">
            <CanvasToolbar selectedElement={selectedElementData} onElementUpdate={updates => selectedElement && handleElementUpdate(selectedElement, updates)} />
          </div>}
        
        <div className="flex justify-center">
          <div className="relative bg-white shadow-lg rounded-lg overflow-hidden" style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          transform: selectedDevice === 'desktop' ? 'scale(0.8)' : selectedDevice === 'tablet' ? 'scale(0.9)' : 'scale(1)',
          transformOrigin: 'top center'
        }}>
            {/* Canvas Background */}
            <div className="absolute inset-0" style={{
            background: background?.type === 'image' ? `url(${background.value}) center/cover no-repeat` : background?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
          }}>
              {/* Clouds */}
              
              
              
              
              
              {/* Roue de la fortune au centre */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div 
                  onClick={() => setShowBorderModal(true)}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <SmartWheel
                    segments={wheelSegments}
                    theme="modern"
                    size={getWheelSize()}
                    borderStyle={wheelBorderStyle}
                    brandColors={{
                      primary: wheelBorderColor,
                      secondary: '#4ecdc4',
                      accent: '#45b7d1'
                    }}
                    customButton={{
                      text: 'JOUER',
                      color: wheelBorderColor,
                      textColor: '#ffffff'
                    }}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* Canvas Elements */}
            {elements.map(element => <CanvasElement key={element.id} element={element} isSelected={selectedElement === element.id} onSelect={() => setSelectedElement(element.id)} onUpdate={updates => handleElementUpdate(element.id, updates)} onDelete={() => handleElementDelete(element.id)} />)}

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
          {selectedDevice} • {canvasSize.width} × {canvasSize.height}px • Cliquez sur la roue pour changer le style de bordure
        </div>

        {/* Modal pour la configuration de la roue */}
        <WheelConfigModal
          isOpen={showBorderModal}
          onClose={() => setShowBorderModal(false)}
          wheelBorderStyle={wheelBorderStyle}
          wheelBorderColor={wheelBorderColor}
          wheelScale={wheelScale}
          onBorderStyleChange={setWheelBorderStyle}
          onBorderColorChange={setWheelBorderColor}
          onScaleChange={setWheelScale}
          selectedDevice={selectedDevice}
        />
      </div>
    </DndProvider>;
};
export default DesignCanvas;
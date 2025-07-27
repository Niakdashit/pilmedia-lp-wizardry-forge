import React, { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import { SmartWheel } from '../SmartWheel';
import WheelConfigModal from './WheelConfigModal';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import type { DeviceType } from '../../utils/deviceDimensions';

export interface DesignCanvasProps {
  selectedDevice: DeviceType;
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
}
const DesignCanvas: React.FC<DesignCanvasProps> = ({
  selectedDevice,
  elements,
  onElementsChange,
  background,
  campaign,
  onCampaignChange
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showBorderModal, setShowBorderModal] = useState(false);
  
  // Récupérer les configurations de la roue depuis la campagne
  const wheelBorderStyle = campaign?.design?.wheelConfig?.borderStyle || 'classic';
  const wheelBorderColor = campaign?.design?.wheelConfig?.borderColor || '#841b60';
  const wheelScale = campaign?.design?.wheelConfig?.scale || 1;

  // Fonctions pour mettre à jour la configuration de la roue
  const setWheelBorderStyle = (style: string) => {
    if (onCampaignChange) {
      onCampaignChange({
        ...campaign,
        design: {
          ...campaign?.design,
          wheelConfig: {
            ...campaign?.design?.wheelConfig,
            borderStyle: style
          }
        }
      });
    }
  };

  const setWheelBorderColor = (color: string) => {
    if (onCampaignChange) {
      onCampaignChange({
        ...campaign,
        design: {
          ...campaign?.design,
          wheelConfig: {
            ...campaign?.design?.wheelConfig,
            borderColor: color
          }
        }
      });
    }
  };

  const setWheelScale = (scale: number) => {
    if (onCampaignChange) {
      onCampaignChange({
        ...campaign,
        design: {
          ...campaign?.design,
          wheelConfig: {
            ...campaign?.design?.wheelConfig,
            scale: scale
          }
        }
      });
    }
  };

  // Intégration du système auto-responsive
  const { applyAutoResponsive, getPropertiesForDevice, DEVICE_DIMENSIONS } = useAutoResponsive();

  // Convertir les éléments en format compatible avec useAutoResponsive
  const responsiveElements = useMemo(() => {
    return elements.map(element => ({
      id: element.id,
      x: element.x || 0,
      y: element.y || 0,
      width: element.width,
      height: element.height,
      fontSize: element.fontSize || 16,
      type: element.type,
      content: element.content,
      // Préserver les autres propriétés
      ...element
    }));
  }, [elements]);

  // Appliquer les calculs responsives
  const elementsWithResponsive = useMemo(() => {
    return applyAutoResponsive(responsiveElements);
  }, [responsiveElements, applyAutoResponsive]);
  const getCanvasSize = () => {
    return DEVICE_DIMENSIONS[selectedDevice];
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

  // Segments pour la roue avec couleurs extraites si disponibles
  const extractedColor = campaign?.design?.brandColors?.primary || '#ff6b6b';
  const whiteColor = '#ffffff';
  
  const wheelSegments = [
    { id: '1', label: '10€', color: extractedColor, textColor: whiteColor },
    { id: '2', label: '20€', color: whiteColor, textColor: extractedColor },
    { id: '3', label: '5€', color: extractedColor, textColor: whiteColor },
    { id: '4', label: 'Perdu', color: whiteColor, textColor: extractedColor },
    { id: '5', label: '50€', color: extractedColor, textColor: whiteColor },
    { id: '6', label: '30€', color: whiteColor, textColor: extractedColor }
  ];
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
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              transform: selectedDevice === 'desktop' ? 'scale(0.8)' : selectedDevice === 'tablet' ? 'scale(0.9)' : 'scale(1)',
              transformOrigin: 'top center'
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedElement(null);
              }
            }}
          >
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
            {elementsWithResponsive.map((element: any) => {
              // Obtenir les propriétés pour l'appareil actuel
              const responsiveProps = getPropertiesForDevice(element, selectedDevice);
              
              // Fusionner les propriétés responsive avec l'élément original
              const elementWithResponsive = {
                ...element,
                x: responsiveProps.x,
                y: responsiveProps.y,
                width: responsiveProps.width,
                height: responsiveProps.height,
                fontSize: responsiveProps.fontSize,
                // Appliquer l'alignement de texte responsive si disponible
                textAlign: responsiveProps.textAlign || element.textAlign
              };

              return (
                <CanvasElement 
                  key={element.id} 
                  element={elementWithResponsive} 
                  selectedDevice={selectedDevice}
                  isSelected={selectedElement === element.id} 
                  onSelect={setSelectedElement} 
                  onUpdate={handleElementUpdate} 
                  onDelete={handleElementDelete} 
                />
              );
            })}

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
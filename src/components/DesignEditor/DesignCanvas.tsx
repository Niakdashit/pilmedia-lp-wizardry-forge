import React, { useState, useMemo, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import { SmartWheel } from '../SmartWheel';
import WheelConfigModal from './WheelConfigModal';
import AlignmentGuides from './components/AlignmentGuides';
import GridOverlay from './components/GridOverlay';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import { useOptimizedDragDrop } from '../ModernEditor/hooks/useOptimizedDragDrop';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { useEditorStore } from '../../stores/editorStore';
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
  zoom?: number;
}
const DesignCanvas: React.FC<DesignCanvasProps> = React.memo(({
  selectedDevice,
  elements,
  onElementsChange,
  background,
  campaign,
  onCampaignChange,
  zoom = 1
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showBorderModal, setShowBorderModal] = useState(false);

  // Store centralisé pour la grille
  const { showGridLines, setShowGridLines } = useEditorStore();

  // Hooks optimisés pour drag & drop et snapping
  useOptimizedDragDrop({
    containerRef: canvasRef,
    previewDevice: selectedDevice
  });

  const { applySnapping } = useSmartSnapping({
    containerRef: canvasRef,
    gridSize: 20,
    snapTolerance: 10
  });
  
  // Récupérer les configurations de la roue depuis la campagne
  const wheelBorderStyle = campaign?.design?.wheelBorderStyle || 'classic';
  const wheelBorderColor = campaign?.design?.wheelConfig?.borderColor || '#841b60';
  const wheelScale = campaign?.design?.wheelConfig?.scale || 2;

  // Fonctions optimisées pour mettre à jour la configuration de la roue
  const setWheelBorderStyle = useCallback((style: string) => {
    if (onCampaignChange) {
      onCampaignChange({
        ...campaign,
        design: {
          ...campaign?.design,
          wheelBorderStyle: style
        }
      });
    }
  }, [campaign, onCampaignChange]);

  const setWheelBorderColor = useCallback((color: string) => {
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
  }, [campaign, onCampaignChange]);

  const setWheelScale = useCallback((scale: number) => {
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
  }, [campaign, onCampaignChange]);

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
  // Taille du canvas memoized
  const canvasSize = useMemo(() => {
    return DEVICE_DIMENSIONS[selectedDevice];
  }, [selectedDevice, DEVICE_DIMENSIONS]);
  // Handlers optimisés avec snapping
  const handleElementUpdate = useCallback((id: string, updates: any) => {
    // Appliquer le snapping si c'est un déplacement
    if (updates.x !== undefined && updates.y !== undefined) {
      const element = elements.find(el => el.id === id);
      if (element) {
        const snappedPosition = applySnapping(
          updates.x,
          updates.y,
          element.width || 100,
          element.height || 100,
          id
        );
        updates.x = snappedPosition.x;
        updates.y = snappedPosition.y;
      }
    }

    onElementsChange(elements.map(el => el.id === id ? {
      ...el,
      ...updates
    } : el));
  }, [elements, onElementsChange, applySnapping]);

  const handleElementDelete = useCallback((id: string) => {
    onElementsChange(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [elements, onElementsChange, selectedElement]);
  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  // Taille de la roue memoized
  const wheelSize = useMemo(() => {
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
  }, [selectedDevice, wheelScale]);

  // Segments de roue memoized
  const wheelSegments = useMemo(() => {
    const extractedColor = campaign?.design?.brandColors?.primary || '#ff6b6b';
    const whiteColor = '#ffffff';
    
    return [
      { id: '1', label: '10€', color: extractedColor, textColor: whiteColor },
      { id: '2', label: '20€', color: whiteColor, textColor: extractedColor },
      { id: '3', label: '5€', color: extractedColor, textColor: whiteColor },
      { id: '4', label: 'Perdu', color: whiteColor, textColor: extractedColor },
      { id: '5', label: '50€', color: extractedColor, textColor: whiteColor },
      { id: '6', label: '30€', color: whiteColor, textColor: extractedColor }
    ];
  }, [campaign?.design?.brandColors?.primary]);
  return <DndProvider backend={HTML5Backend}>
      <div className="relative flex-1 w-full h-full bg-gray-100 p-8 overflow-auto">
        {/* Canvas Toolbar - Only show when text element is selected */}
        {selectedElementData && selectedElementData.type === 'text' && <div className="flex justify-center mb-4">
            <CanvasToolbar selectedElement={selectedElementData} onElementUpdate={updates => selectedElement && handleElementUpdate(selectedElement, updates)} />
          </div>}
        
        <div className="relative w-full h-full min-h-[600px]">
          {/* Canvas absolutely centered */}
          <div
            ref={canvasRef}
            className="absolute bg-white shadow-lg rounded-lg overflow-hidden"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              minWidth: `${canvasSize.width}px`,
              minHeight: `${canvasSize.height}px`,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) scale(${zoom})`,
              transformOrigin: 'center center'
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
              {/* Grid Overlay Optimisé */}
              <GridOverlay 
                canvasSize={canvasSize}
                showGrid={showGridLines}
                gridSize={20}
                opacity={0.15}
              />
              
              {/* Alignment Guides */}
              <AlignmentGuides
                canvasSize={canvasSize}
                elements={elementsWithResponsive}
              />
              
              {/* Clouds */}
              
              
              
              
              
              {/* Roue de la fortune en bas */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3/5">
                <div 
                  onClick={() => setShowBorderModal(true)}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <SmartWheel
                    segments={wheelSegments}
                    theme="modern"
                    size={wheelSize}
                    borderStyle={wheelBorderStyle}
                    brandColors={{
                      primary: wheelBorderColor,
                      secondary: '#4ecdc4',
                      accent: '#45b7d1'
                    }}
                    buttonPosition="center"
                    customButton={{
                      text: 'GO',
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
                  containerRef={canvasRef}
                />
              );
            })}

            {/* Grid and Guides Toggle */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => setShowGridLines(!showGridLines)}
                className={`p-2 rounded-lg shadow-sm text-xs z-40 transition-colors ${
                  showGridLines 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-white/80 hover:bg-white text-gray-700'
                }`}
                title="Afficher/masquer la grille (G)"
              >
                📐
              </button>
            </div>

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
});

DesignCanvas.displayName = 'DesignCanvas';

export default DesignCanvas;
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import CanvasToolbar from './CanvasToolbar';
import StandardizedWheel from '../shared/StandardizedWheel';
import WheelConfigModal from './WheelConfigModal';
import AlignmentGuides from './components/AlignmentGuides';
import GridOverlay from './components/GridOverlay';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import { useOptimizedDragDrop } from '../ModernEditor/hooks/useOptimizedDragDrop';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { useEditorStore } from '../../stores/editorStore';
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
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

  // Hook de synchronisation unifié pour la roue
  const { updateWheelConfig, getCanonicalConfig } = useWheelConfigSync({
    campaign,
    extractedColors: campaign?.design?.brandColors ? Object.values(campaign.design.brandColors) : [],
    onCampaignChange
  });

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

  // Configuration canonique de la roue
  const wheelConfig = useMemo(() => 
    getCanonicalConfig({ device: selectedDevice, shouldCropWheel: true }),
    [getCanonicalConfig, selectedDevice]
  );

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

  // Les segments et tailles sont maintenant gérés par StandardizedWheel
  return <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-gray-100 p-8 overflow-auto">
        {/* Canvas Toolbar - Only show when text element is selected */}
        {selectedElementData && selectedElementData.type === 'text' && <div className="flex justify-center mb-4">
            <CanvasToolbar selectedElement={selectedElementData} onElementUpdate={updates => selectedElement && handleElementUpdate(selectedElement, updates)} />
          </div>}
        
        <div className="flex justify-center items-center min-h-full">
          {/* Canvas wrapper pour maintenir le centrage avec zoom */}
          <div 
            className="flex justify-center items-center"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '600px'
            }}
          >
            <div 
              ref={canvasRef}
              className="relative bg-white shadow-lg rounded-lg overflow-hidden" 
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                minWidth: `${canvasSize.width}px`,
                minHeight: `${canvasSize.height}px`,
                flexShrink: 0,
                transform: `scale(${zoom})`,
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
              
              
              
              
              
              {/* Roue standardisée avec découpage cohérent */}
              <StandardizedWheel
                campaign={campaign}
                device={selectedDevice}
                shouldCropWheel={true}
                disabled={true}
                onClick={() => setShowBorderModal(true)}
              />
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
          wheelBorderStyle={wheelConfig.borderStyle}
          wheelBorderColor={wheelConfig.borderColor}
          wheelScale={wheelConfig.scale}
          onBorderStyleChange={(style) => updateWheelConfig({ borderStyle: style })}
          onBorderColorChange={(color) => updateWheelConfig({ borderColor: color })}
          onScaleChange={(scale) => updateWheelConfig({ scale })}
          selectedDevice={selectedDevice}
        />
      </div>
    </DndProvider>;
});

DesignCanvas.displayName = 'DesignCanvas';

export default DesignCanvas;
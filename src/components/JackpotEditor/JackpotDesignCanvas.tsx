import React, { useState, useMemo, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from '../DesignEditor/CanvasElement';
import CanvasToolbar from '../ModelEditor/CanvasToolbar';
import SmartAlignmentGuides from '../DesignEditor/components/SmartAlignmentGuides';
import AlignmentToolbar from '../DesignEditor/components/AlignmentToolbar';
import GridOverlay from '../DesignEditor/components/GridOverlay';
import ZoomSlider from '../DesignEditor/components/ZoomSlider';
import GroupSelectionFrame from '../DesignEditor/components/GroupSelectionFrame';
import { useAutoResponsive } from '../../hooks/useAutoResponsive';
import { useSmartSnapping } from '../ModernEditor/hooks/useSmartSnapping';
import { useAlignmentSystem } from '../DesignEditor/hooks/useAlignmentSystem';
import { useAdvancedCache } from '../ModernEditor/hooks/useAdvancedCache';
import { useAdaptiveAutoSave } from '../ModernEditor/hooks/useAdaptiveAutoSave';
import { useUltraFluidDragDrop } from '../ModernEditor/hooks/useUltraFluidDragDrop';
import { useVirtualizedCanvas } from '../ModernEditor/hooks/useVirtualizedCanvas';
import { useEditorStore } from '../../stores/editorStore';
import CanvasContextMenu from '../DesignEditor/components/CanvasContextMenu';

import AnimationSettingsPopup from '../DesignEditor/panels/AnimationSettingsPopup';
import MobileResponsiveLayout from '../DesignEditor/components/MobileResponsiveLayout';
import type { DeviceType } from '../../utils/deviceDimensions';
import { isRealMobile } from '../../utils/isRealMobile';

// Import du jeu Jackpot
import JackpotGame from './JackpotGame';

export interface JackpotDesignCanvasProps {
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
  onZoomChange?: (zoom: number) => void;
  selectedElement?: any;
  onSelectedElementChange?: (element: any) => void;
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onElementUpdate?: (updates: any) => void;
  onContentBoundsChange?: (bounds: { x: number; y: number; width: number; height: number } | null) => void;
  selectedGroupId?: string;
  onSelectedGroupChange?: (groupId: string | null) => void;
  groups?: any[];
  onGroupMove?: (groupId: string, deltaX: number, deltaY: number) => void;
  onGroupResize?: (groupId: string, bounds: any) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  onShowDesignPanel?: () => void;
  onOpenElementsTab?: () => void;
  onAddElement?: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  enableInternalAutoFit?: boolean;
  extractedColors?: string[];
  showQuizPanel?: boolean;
  onQuizPanelChange?: (show: boolean) => void;
  readOnly?: boolean;
  containerClassName?: string;
  
  // Props spécifiques au Jackpot
  jackpotConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    slotBackgroundColor?: string;
    symbols?: string[];
    winProbability?: number;
    rollDuration?: number;
    borderRadius?: number;
    slotSize?: number;
    containerPadding?: number;
  };
  onJackpotConfigChange?: (config: any) => void;
}

const JackpotDesignCanvas = React.forwardRef<HTMLDivElement, JackpotDesignCanvasProps>(({ 
  selectedDevice,
  elements,
  onElementsChange,
  background,
  campaign,
  onCampaignChange,
  zoom = 1,
  onZoomChange,
  selectedElement: externalSelectedElement,
  onSelectedElementChange,
  selectedElements,
  onSelectedElementsChange,
  onElementUpdate: externalOnElementUpdate,
  selectedGroupId,
  onSelectedGroupChange,
  groups,
  onGroupMove,
  onGroupResize,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  onShowDesignPanel,
  onOpenElementsTab,
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  enableInternalAutoFit = false,
  onContentBoundsChange,
  onQuizPanelChange,
  readOnly = false,
  containerClassName,
  jackpotConfig = {},
  onJackpotConfigChange
}, ref) => {

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoFitEnabledRef = useRef(true);
  
  const activeCanvasRef = ref || canvasRef;
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [localZoom, setLocalZoom] = useState<number>(
    typeof zoom === 'number' && !Number.isNaN(zoom)
      ? Math.max(0.1, Math.min(1, zoom))
      : 1
  );
  const [panOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [showAnimationPopup, setShowAnimationPopup] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<any>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

  const suppressNextClickClearRef = useRef(false);
  const [measuredBounds, setMeasuredBounds] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({});

  const handleMeasureBounds = useCallback((id: string, rect: { x: number; y: number; width: number; height: number }) => {
    setMeasuredBounds(prev => {
      const prevRect = prev[id];
      if (prevRect && prevRect.x === rect.x && prevRect.y === rect.y && prevRect.width === rect.width && prevRect.height === rect.height) {
        return prev;
      }
      return { ...prev, [id]: rect };
    });
  }, []);

  const { applyAutoResponsive, getPropertiesForDevice, DEVICE_DIMENSIONS } = useAutoResponsive();

  const canvasSize = useMemo(() => {
    return DEVICE_DIMENSIONS[selectedDevice];
  }, [selectedDevice, DEVICE_DIMENSIONS]);

  const effectiveCanvasSize = useMemo(() => {
    if (selectedDevice === 'mobile') {
      return { width: 360, height: 640 };
    }
    return canvasSize;
  }, [selectedDevice, canvasSize]);

  const elementById = useMemo(() => {
    const m = new Map<string, any>();
    for (const el of elements) m.set(el.id, el);
    return m;
  }, [elements]);

  const devicePropsById = useMemo(() => {
    const m = new Map<string, any>();
    for (const el of elements) m.set(el.id, getPropertiesForDevice(el, selectedDevice));
    return m;
  }, [elements, selectedDevice, getPropertiesForDevice]);

  const elementCache = useAdvancedCache({
    maxSize: 5 * 1024 * 1024,
    maxEntries: 200,
    ttl: 10 * 60 * 1000,
    enableCompression: true,
    storageKey: 'jackpot-canvas-cache'
  });

  const { updateData: updateAutoSaveData, recordActivity } = useAdaptiveAutoSave({
    onSave: async (data) => {
      if (onCampaignChange) {
        onCampaignChange(data);
      }
    },
    baseDelay: 2000,
    minDelay: 500,
    maxDelay: 8000,
    onSaveSuccess: () => {
      console.log('✓ Sauvegarde automatique réussie');
    },
    onError: (error) => {
      console.warn('⚠️ Erreur de sauvegarde automatique:', error);
    }
  });

  const { applySnapping } = useSmartSnapping({
    containerRef: activeCanvasRef,
    gridSize: 20,
    snapTolerance: 3
  });

  const { showGridLines, setShowGridLines } = useEditorStore();

  const alignmentElements = useMemo(() => {
    return elements.map((el: any) => {
      const mb = measuredBounds[el.id];
      const x = (mb?.x != null) ? mb.x : Number(el.x) || 0;
      const y = (mb?.y != null) ? mb.y : Number(el.y) || 0;
      const width = (mb?.width != null) ? mb.width : Math.max(20, Number(el.width) || 100);
      const height = (mb?.height != null) ? mb.height : Math.max(20, Number(el.height) || 30);
      return { id: String(el.id), x, y, width, height };
    });
  }, [elements, measuredBounds]);

  const {
    currentGuides,
    isDragging,
    snapElement,
    startDragging,
    stopDragging
  } = useAlignmentSystem({
    elements: alignmentElements,
    canvasSize: effectiveCanvasSize,
    zoom: localZoom,
    snapTolerance: 8,
    gridSize: 20,
    showGrid: showGridLines
  });

  const handleElementUpdate = useCallback((id: string, updates: any) => {
    if (externalOnElementUpdate && selectedElement === id) {
      try { externalOnElementUpdate(updates); } catch {}
    }

    const updatedElements = elements.map(el => {
      if (el.id !== id) return el;
      return { ...el, ...updates };
    });

    onElementsChange(updatedElements);

    const activityType = (updates.x !== undefined || updates.y !== undefined) ? 'drag' : 'click';
    const intensity = activityType === 'drag' ? 0.8 : 0.5;
    updateAutoSaveData(campaign, activityType, intensity);
  }, [elements, onElementsChange, updateAutoSaveData, campaign, externalOnElementUpdate, selectedElement]);

  const deviceDefaultZoom = useMemo(() => {
    return selectedDevice === 'mobile' ? 0.85 :
           selectedDevice === 'tablet' ? 0.6 : 0.7;
  }, [selectedDevice]);

  const handleZoomChange = useCallback((value: number) => {
    const clamped = Math.max(0.1, Math.min(1, value));
    autoFitEnabledRef.current = false;
    setLocalZoom(clamped);
    if (onZoomChange) {
      onZoomChange(clamped);
    }
  }, [onZoomChange]);

  const handleClearSelection = useCallback(() => {
    setSelectedElement(null);
    onSelectedElementChange?.(null);
    onSelectedElementsChange?.([]);
  }, [onSelectedElementChange, onSelectedElementsChange]);

  // Configuration par défaut du Jackpot
  const defaultJackpotConfig = {
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#1f2937',
    slotBackgroundColor: '#ffffff',
    symbols: ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '🍀'],
    winProbability: 0.15,
    rollDuration: 2000,
    borderRadius: 16,
    slotSize: 80,
    containerPadding: 20,
    ...jackpotConfig
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <MobileResponsiveLayout
        selectedDevice={selectedDevice}
        containerClassName={containerClassName}
        canvasRef={activeCanvasRef}
        zoom={localZoom}
        onZoomChange={onZoomChange}
        selectedElement={selectedElement}
        onElementUpdate={handleElementUpdate}
        onClearSelection={handleClearSelection}
      >
        {/* Canvas Background */}
        <div 
          className="relative w-full h-full overflow-hidden"
          style={{
            background: background?.type === 'color' 
              ? background.value 
              : background?.type === 'image' 
                ? `url(${background.value})` 
                : '#f8fafc'
          }}
        >
          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center"
            style={{
              padding: '40px'
            }}
          >
            {/* Main Canvas */}
            <div
              ref={activeCanvasRef}
              className="relative bg-white shadow-2xl"
              style={{
                width: `${effectiveCanvasSize.width}px`,
                height: `${effectiveCanvasSize.height}px`,
                transform: `scale(${localZoom})`,
                transformOrigin: 'center center',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {/* Canvas Elements Layer */}
              <div className="absolute inset-0">
                {elements.map((element: any) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={selectedElement === element.id}
                    onSelect={() => {
                      setSelectedElement(element.id);
                      onSelectedElementChange?.(element);
                    }}
                    onUpdate={(updates) => handleElementUpdate(element.id, updates)}
                    onMeasureBounds={handleMeasureBounds}
                    selectedDevice={selectedDevice}
                    zoom={localZoom}
                    readOnly={readOnly}
                  />
                ))}
              </div>

              {/* Jackpot Game Layer - Centré dans le canvas */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 1000 }}
              >
                <div className="pointer-events-auto">
                  <JackpotGame
                    primaryColor={defaultJackpotConfig.primaryColor}
                    secondaryColor={defaultJackpotConfig.secondaryColor}
                    backgroundColor={defaultJackpotConfig.backgroundColor}
                    slotBackgroundColor={defaultJackpotConfig.slotBackgroundColor}
                    symbols={defaultJackpotConfig.symbols}
                    winProbability={defaultJackpotConfig.winProbability}
                    rollDuration={defaultJackpotConfig.rollDuration}
                    borderRadius={defaultJackpotConfig.borderRadius}
                    slotSize={defaultJackpotConfig.slotSize}
                    containerPadding={defaultJackpotConfig.containerPadding}
                    onWin={() => console.log('🎉 Jackpot gagné!')}
                    onLose={() => console.log('😔 Pas de chance...')}
                    onGameStart={() => console.log('🎰 Jeu lancé!')}
                  />
                </div>
              </div>

              {/* Grid Overlay */}
              {showGridLines && (
                <GridOverlay
                  canvasSize={effectiveCanvasSize}
                  gridSize={20}
                  zoom={localZoom}
                />
              )}

              {/* Alignment Guides */}
              <SmartAlignmentGuides
                guides={currentGuides}
                canvasSize={effectiveCanvasSize}
                zoom={localZoom}
              />
            </div>
          </div>
        </div>

        {/* Zoom Slider */}
        {selectedDevice !== 'mobile' && (
          <ZoomSlider
            zoom={localZoom}
            onZoomChange={handleZoomChange}
            minZoom={0.1}
            maxZoom={1}
            step={0.05}
            defaultZoom={deviceDefaultZoom}
          />
        )}

        {/* Animation Popup */}
        {showAnimationPopup && selectedAnimation && (
          <AnimationSettingsPopup
            animation={selectedAnimation}
            position={popupPosition}
            onApply={(settings) => {
              if (selectedElement) {
                handleElementUpdate(selectedElement, settings);
                setShowAnimationPopup(false);
              }
            }}
            onClose={() => setShowAnimationPopup(false)}
            visible={showAnimationPopup}
          />
        )}
      </MobileResponsiveLayout>
    </DndProvider>
  );
});

JackpotDesignCanvas.displayName = 'JackpotDesignCanvas';

export default JackpotDesignCanvas;

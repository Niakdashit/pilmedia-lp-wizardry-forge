import React, { useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CanvasElement from './CanvasElement';
import type { DeviceType } from '../../utils/deviceDimensions';

export interface DesignCanvasProps {
  selectedDevice: DeviceType;
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background: { type: 'color' | 'image'; value: string };
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  selectedElement?: string | null;
  onSelectedElementChange?: (elementId: string | null) => void;
  selectedElements?: string[];
  onSelectedElementsChange?: (elementIds: string[]) => void;
  onElementUpdate?: (elementId: string, updates: any) => void;
  extractedColors?: string[];
  quizModalConfig?: any;
  readOnly?: boolean;
  containerClassName?: string;
  showQuizPanel?: boolean;
  onQuizPanelChange?: (show: boolean) => void;
  onShowEffectsPanel?: () => void;
  onShowAnimationsPanel?: () => void;
  onShowPositionPanel?: () => void;
  onShowDesignPanel?: (context?: 'fill' | 'border' | 'text') => void;
  onOpenElementsTab?: () => void;
  onAddElement?: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  selectedGroupId?: string | null;
  onSelectedGroupChange?: (groupId: string | null) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const DesignCanvas = React.forwardRef<HTMLDivElement, DesignCanvasProps>(({
  selectedDevice,
  elements,
  onElementsChange,
  background,
  campaign,
  onCampaignChange,
  zoom = 1,
  onZoomChange,
  selectedElement,
  onSelectedElementChange,
  selectedElements = [],
  onSelectedElementsChange,
  onElementUpdate,
  extractedColors,
  quizModalConfig,
  readOnly = false,
  containerClassName = '',
  showQuizPanel = false,
  onQuizPanelChange,
  onShowEffectsPanel,
  onShowAnimationsPanel,
  onShowPositionPanel,
  onShowDesignPanel,
  onOpenElementsTab,
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  selectedGroupId,
  onSelectedGroupChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}, ref) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const handleElementSelect = useCallback((elementId: string) => {
    onSelectedElementChange?.(elementId);
  }, [onSelectedElementChange]);

  const handleElementUpdate = useCallback((elementId: string, updates: any) => {
    const updatedElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    onElementsChange(updatedElements);
  }, [elements, onElementsChange]);

  const handleElementDelete = useCallback((elementId: string) => {
    const filteredElements = elements.filter(el => el.id !== elementId);
    onElementsChange(filteredElements);
    if (selectedElement === elementId) {
      onSelectedElementChange?.(null);
    }
  }, [elements, onElementsChange, selectedElement, onSelectedElementChange]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onSelectedElementChange?.(null);
    }
  }, [onSelectedElementChange]);

  const canvasStyle = {
    background: background.type === 'color' ? background.value : `url(${background.value})`,
    backgroundSize: background.type === 'image' ? 'cover' : undefined,
    backgroundPosition: background.type === 'image' ? 'center' : undefined,
    backgroundRepeat: background.type === 'image' ? 'no-repeat' : undefined,
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  };

  const getDeviceDimensions = () => {
    switch (selectedDevice) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      default:
        return { width: 1200, height: 800 };
    }
  };

  const { width: canvasWidth, height: canvasHeight } = getDeviceDimensions();

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        ref={ref}
        className={`relative overflow-auto bg-gray-50 ${containerClassName}`}
        style={{ minHeight: '100vh' }}
      >
        <div
          ref={canvasRef}
          className="relative mx-auto my-8 shadow-lg border border-gray-200 cursor-default"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            ...canvasStyle
          }}
          onClick={handleCanvasClick}
        >
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedElement === element.id}
              onSelect={handleElementSelect}
              onUpdate={handleElementUpdate}
              onDelete={handleElementDelete}
              selectedDevice={selectedDevice}
              containerRef={canvasRef}
              elements={elements}
              readOnly={readOnly}
              campaign={campaign}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
});

DesignCanvas.displayName = 'DesignCanvas';

export default DesignCanvas;
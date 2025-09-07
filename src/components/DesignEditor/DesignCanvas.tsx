import React from 'react';
import MobileStableEditor from '../QuizEditor/components/MobileStableEditor';
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
  wheelModalConfig?: any;
  extractedColors?: string[];
  updateWheelConfig?: (updates: any) => void;
  getCanonicalConfig?: (options?: { device?: string; shouldCropWheel?: boolean }) => any;
  showWheelPanel?: boolean;
  onWheelPanelChange?: (show: boolean) => void;
  readOnly?: boolean;
  containerClassName?: string;
}

const DesignCanvas = React.forwardRef<HTMLDivElement, DesignCanvasProps>(({ 
  selectedDevice,
  elements = [],
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
  onContentBoundsChange,
  selectedGroupId,
  onSelectedGroupChange,
  groups = [],
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
  canUndo = false,
  canRedo = false,
  enableInternalAutoFit = false,
  onWheelPanelChange,
  readOnly = false,
  containerClassName,
  updateWheelConfig,
  getCanonicalConfig,
  wheelModalConfig,
  extractedColors = []
}, ref) => {
  
  return (
    <MobileStableEditor>
      <div className="design-canvas-content">
        {/* Simplified canvas wrapper */}
        <div className="canvas-wrapper">
          <div 
            className={`canvas ${containerClassName || ''}`}
            style={{ 
              width: '100%',
              height: '100%',
              background: background?.type === 'color' ? background.value : undefined 
            }}
          >
            {/* Canvas elements would be rendered here */}
            {elements?.map((element, index) => (
              <div key={element.id || index} style={{
                position: 'absolute',
                left: element.x || 0,
                top: element.y || 0,
                width: element.width || 100,
                height: element.height || 30
              }}>
                {element.type === 'text' && element.text}
                {element.type === 'image' && <img src={element.src} alt="" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileStableEditor>
  );
});

DesignCanvas.displayName = 'DesignCanvas';

export default DesignCanvas;
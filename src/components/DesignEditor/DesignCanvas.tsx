import React, { useMemo } from 'react';
import ScaledGamePreview from './ScaledGamePreview';
import { DEVICE_CONSTRAINTS } from '../QuickCampaign/Preview/utils/previewConstraints';

export interface DesignCanvasProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
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
  // Prepare campaign with current editor state
  const editorCampaign = useMemo(() => ({
    ...campaign,
    design: {
      ...campaign?.design,
      customTexts: elements.filter(el => el.type === 'text'),
      customImages: elements.filter(el => el.type === 'image'),
      background: background
    }
  }), [campaign, elements, background]);

  const getCanvasSize = () => {
    const constraints = DEVICE_CONSTRAINTS[selectedDevice];
    return {
      width: constraints.maxWidth,
      height: constraints.maxHeight
    };
  };
  const canvasSize = getCanvasSize();
  
  const handleCampaignUpdate = (updatedCampaign: any) => {
    // Extract elements from the updated campaign and sync back to editor state
    const texts = updatedCampaign?.design?.customTexts || [];
    const images = updatedCampaign?.design?.customImages || [];
    const allElements = [...texts, ...images];
    onElementsChange(allElements);
    onCampaignChange?.(updatedCampaign);
  };

  const getContainerClass = () => {
    if (selectedDevice === 'desktop') {
      return "flex-1 bg-gray-100 p-4 overflow-auto";
    } else if (selectedDevice === 'tablet') {
      return "flex-1 overflow-auto flex flex-col pb-16";
    } else {
      return "flex-1 overflow-hidden flex flex-col";
    }
  };

  const getCanvasContainerClass = () => {
    if (selectedDevice === 'desktop') {
      return "flex justify-center";
    } else {
      return "flex-1 flex justify-center items-center";
    }
  };

  const getContainerSize = () => {
    if (selectedDevice === 'desktop') {
      return {
        width: canvasSize.width,
        height: canvasSize.height
      };
    } else {
      // On mobile et tablet, utiliser toute la hauteur disponible moins l'info
      return {
        width: canvasSize.width,
        height: '100%'
      };
    }
  };

  const containerSize = getContainerSize();

  return (
    <div className={getContainerClass()}>
      <div className={getCanvasContainerClass()}>
        <ScaledGamePreview
          campaign={editorCampaign}
          selectedDevice={selectedDevice}
          containerWidth={typeof containerSize.width === 'string' ? canvasSize.width : containerSize.width}
          containerHeight={typeof containerSize.height === 'string' ? window.innerHeight - 120 : containerSize.height}
          onCampaignChange={handleCampaignUpdate}
        />
      </div>

      {/* Canvas Info */}
      {selectedDevice === 'desktop' && (
        <div className="text-center mt-4 text-sm text-gray-500">
          {selectedDevice} • {canvasSize.width} × {canvasSize.height}px • Aperçu synchronisé avec le bouton "Aperçu"
        </div>
      )}
    </div>
  );
};
export default DesignCanvas;
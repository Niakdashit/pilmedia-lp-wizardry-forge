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

  return (
    <div className="flex-1 overflow-auto">
      <div className="w-full h-full">
        <ScaledGamePreview
          campaign={editorCampaign}
          selectedDevice={selectedDevice}
          containerWidth={canvasSize.width}
          containerHeight={canvasSize.height}
          onCampaignChange={handleCampaignUpdate}
        />
      </div>
    </div>
  );
};
export default DesignCanvas;
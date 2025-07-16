import React from 'react';
import type { DeviceType, EditorConfig, CustomText } from './QualifioEditorLayout';
import DeviceFrame from './Preview/DeviceFrame';
import Mode1Preview from './Preview/Mode1Preview';
import Mode2Preview from './Preview/Mode2Preview';

interface QualifioPreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onConfigUpdate?: (updates: Partial<EditorConfig>) => void;
}

const QualifioPreview: React.FC<QualifioPreviewProps> = ({ device, config, onConfigUpdate }) => {
  const handleTextUpdate = (updatedText: CustomText) => {
    if (!onConfigUpdate) return;
    
    const updatedTexts = config.customTexts?.map(text => 
      text.id === updatedText.id ? updatedText : text
    ) || [];
    
    onConfigUpdate({ customTexts: updatedTexts });
  };

  const handleTextDelete = (textId: string) => {
    if (!onConfigUpdate) return;
    
    const updatedTexts = config.customTexts?.filter(text => text.id !== textId) || [];
    onConfigUpdate({ customTexts: updatedTexts });
  };

  const handleContainerClick = () => {
    // Handle container click if needed
  };

  const fitContentDesktop = config.displayMode === 'mode1-banner-game';

  return (
    <DeviceFrame device={device} fitContentDesktop={fitContentDesktop}>
      {config.displayMode === 'mode2-background' ? (
        <Mode2Preview
          device={device}
          config={config}
          onTextUpdate={handleTextUpdate}
          onTextDelete={handleTextDelete}
          onContainerClick={handleContainerClick}
        />
      ) : (
        <Mode1Preview
          device={device}
          config={config}
          onTextUpdate={handleTextUpdate}
          onTextDelete={handleTextDelete}
          onContainerClick={handleContainerClick}
        />
      )}
    </DeviceFrame>
  );
};

export default QualifioPreview;
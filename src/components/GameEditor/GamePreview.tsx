import React from 'react';
import type { DeviceType, EditorConfig, CustomText } from './GameEditorLayout';
import DeviceFrame from './Preview/DeviceFrame';
import Mode1Preview from './Preview/Mode1Preview';
import Mode2Preview from './Preview/Mode2Preview';

interface GamePreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onConfigUpdate?: (updates: Partial<EditorConfig>) => void;
  isLivePreview?: boolean;
  triggerAutoSync?: () => void;
}

const GamePreview: React.FC<GamePreviewProps> = ({ device, config, onConfigUpdate, isLivePreview = false, triggerAutoSync }) => {
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

  const handleImageUpdate = (updatedImage: any) => {
    if (!onConfigUpdate) return;
    
    const updatedImages = config.design?.customImages?.map(image => 
      image.id === updatedImage.id ? updatedImage : image
    ) || [];
    
    onConfigUpdate({ 
      design: { 
        ...config.design, 
        customImages: updatedImages 
      } 
    });
  };

  const handleImageDelete = (imageId: string) => {
    if (!onConfigUpdate) return;
    
    const updatedImages = config.design?.customImages?.filter(image => image.id !== imageId) || [];
    onConfigUpdate({
      design: { 
        ...config.design, 
        customImages: updatedImages 
      } 
    });
  };

  const handleContainerClick = () => {
    // Handle container click if needed
  };

  const fitContentDesktop = config.displayMode === 'mode1-banner-game';

  return (
    <>
      {config.displayMode === 'mode2-background' ? (
        isLivePreview ? (
          <div className="w-full h-full">
            <Mode2Preview
              device={device}
              config={config}
              onTextUpdate={handleTextUpdate}
              onTextDelete={handleTextDelete}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
              onContainerClick={handleContainerClick}
              triggerAutoSync={triggerAutoSync}
            />
          </div>
        ) : (
          <DeviceFrame device={device} fitContentDesktop={fitContentDesktop}>
            <Mode2Preview
              device={device}
              config={config}
              onTextUpdate={handleTextUpdate}
              onTextDelete={handleTextDelete}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
              onContainerClick={handleContainerClick}
              triggerAutoSync={triggerAutoSync}
            />
          </DeviceFrame>
        )
      ) : (
        <DeviceFrame device={device} fitContentDesktop={fitContentDesktop}>
          <Mode1Preview
            device={device}
            config={config}
            onTextUpdate={handleTextUpdate}
            onTextDelete={handleTextDelete}
            onImageUpdate={handleImageUpdate}
            onImageDelete={handleImageDelete}
            onContainerClick={handleContainerClick}
            triggerAutoSync={triggerAutoSync}
          />
        </DeviceFrame>
      )}
    </>
  );
};

export default GamePreview;
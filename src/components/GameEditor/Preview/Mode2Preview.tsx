
import React, { useState } from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../GameEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import GameRenderer from './GameRenderer';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';

interface Mode2PreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onTextUpdate: (updatedText: CustomText) => void;
  onTextDelete: (textId: string) => void;
  onImageUpdate: (updatedImage: any) => void;
  onImageDelete: (imageId: string) => void;
  onContainerClick?: () => void;
  triggerAutoSync?: () => void;
}

const Mode2Preview: React.FC<Mode2PreviewProps> = ({
  device,
  config,
  onTextUpdate,
  onTextDelete,
  onImageUpdate,
  onImageDelete,
  onContainerClick,
  triggerAutoSync
}) => {
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleContainerClick = () => {
    setSelectedTextId(null);
    setSelectedImageId(null);
    if (onContainerClick) {
      onContainerClick();
    }
  };

  // Debug: Log rendering data
  console.log('🎨 Mode2Preview rendering:', {
    device,
    displayMode: config.displayMode,
    customTextsCount: config.customTexts?.length || 0,
    customImagesCount: config.design?.customImages?.length || 0,
    customTexts: config.customTexts
  });

  // Get full screen class for device
  const getFullScreenClass = () => {
    switch (device) {
      case 'mobile':
      case 'tablet':
        return 'w-full h-full';
      case 'desktop':
      default:
        return 'relative';
    }
  };

  return (
    <div>
      <BackgroundContainer
        device={device}
        config={config}
        onClick={handleContainerClick}
        className={getFullScreenClass()}
      >
        <div>
          <GameRenderer 
            gameType={config.gameType} 
            config={config} 
            device={device} 
          />
        </div>
        
        {/* Custom editable images */}
        {config.design?.customImages?.map((image: any) => {
          console.log('🖼️ Mode2Preview rendering image:', {
            id: image.id,
            src: image.src,
            x: image.x,
            y: image.y,
            enabled: image.enabled
          });
          
          return (
            <div
              key={image.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 19 }}
            >
              <div className="relative w-full h-full pointer-events-auto">
                <EditableImage
                  image={image}
                  onUpdate={onImageUpdate}
                  onDelete={onImageDelete}
                  isSelected={selectedImageId === image.id}
                  onSelect={setSelectedImageId}
                />
              </div>
            </div>
          );
        })}

        {/* Custom editable texts */}
        {config.customTexts?.map((text) => {
          console.log('📝 Mode2Preview rendering text:', {
            id: text.id,
            content: text.content,
            x: text.x,
            y: text.y,
            color: text.color,
            enabled: text.enabled
          });
          
          // Skip if text is disabled or has no content
          if (!text.enabled || !text.content) {
            console.log('📝 Mode2Preview skipping text (disabled or no content):', text.id);
            return null;
          }
          
          return (
            <div
              key={text.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 20 }}
            >
              <div className="relative w-full h-full pointer-events-auto">
                <EditableText
                  text={text}
                  onUpdate={onTextUpdate}
                  onDelete={onTextDelete}
                  isSelected={selectedTextId === text.id}
                  onSelect={setSelectedTextId}
                  device={device}
                  triggerAutoSync={triggerAutoSync}
                />
              </div>
            </div>
          );
        })}
      </BackgroundContainer>
    </div>
  );
};

export default Mode2Preview;


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

  // Obtenir la classe CSS pour le full écran selon l'appareil
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
        
        {/* Custom editable images - positioned absolutely over the whole layout */}
        {config.design?.customImages?.map((image: any) => (
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
        ))}

        {/* Custom editable texts - positioned absolutely over the whole layout */}
        {config.customTexts?.map((text) => (
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
        ))}
      </BackgroundContainer>
    </div>
  );
};

export default Mode2Preview;

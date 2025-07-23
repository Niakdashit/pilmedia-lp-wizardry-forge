
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

  // Log pour debug
  console.log('🖥️ Mode2Preview - Rendu avec:', {
    customTexts: config.customTexts?.length || 0,
    customImages: config.design?.customImages?.length || 0,
    device,
    displayMode: config.displayMode,
    backgroundImage: config.design?.backgroundImage
  });

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
        {config.design?.customImages?.map((image: any) => {
          console.log('🖼️ Mode2Preview - Rendu image:', image);
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

        {/* Custom editable texts - positioned absolutely over the whole layout */}
        {config.customTexts?.map((text) => {
          console.log('📝 Mode2Preview - Rendu texte:', {
            id: text.id,
            content: text.content?.substring(0, 50) + '...',
            x: text.x,
            y: text.y,
            color: text.color,
            backgroundColor: text.backgroundColor,
            fontSize: text.fontSize,
            visible: true
          });
          return (
            <div
              key={text.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ 
                zIndex: 25, // Z-index plus élevé pour les textes
                visibility: 'visible',
                opacity: 1
              }}
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

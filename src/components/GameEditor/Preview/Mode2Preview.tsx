
import React, { useState, useMemo } from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../GameEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import GameRenderer from './GameRenderer';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';
import { useUniversalResponsive } from '../../../hooks/useUniversalResponsive';

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

  // Système responsif unifié - utiliser le device courant comme base
  const { applyAutoResponsive, getPropertiesForDevice } = useUniversalResponsive('desktop');

  // Convertir les textes en format responsif
  const responsiveTexts = useMemo(() => {
    if (!config.customTexts) return [];
    const convertedTexts = config.customTexts.map(text => ({
      ...text,
      type: 'text' as const,
      x: text.x || 0,
      y: text.y || 0,
      fontSize: text.fontSize || 16,
      textAlign: (text.textAlign || 'left') as 'left' | 'center' | 'right'
    }));
    return applyAutoResponsive(convertedTexts);
  }, [config.customTexts, applyAutoResponsive]);

  // Convertir les images en format responsif
  const responsiveImages = useMemo(() => {
    if (!config.design?.customImages) return [];
    const convertedImages = config.design.customImages.map(image => ({
      ...image,
      type: 'image' as const,
      x: image.x || 0,
      y: image.y || 0,
      width: image.width || 150,
      height: image.height || 150
    }));
    return applyAutoResponsive(convertedImages);
  }, [config.design?.customImages, applyAutoResponsive]);

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
        {responsiveImages.map((image: any) => {
          const imageProps = getPropertiesForDevice(image, device);
          const responsiveImage = { ...image, ...imageProps };
          
          return (
            <div
              key={image.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 19 }}
            >
              <div className="relative w-full h-full pointer-events-auto">
                <EditableImage
                  image={responsiveImage}
                  onUpdate={onImageUpdate}
                  onDelete={onImageDelete}
                  isSelected={selectedImageId === image.id}
                  onSelect={setSelectedImageId}
                />
              </div>
            </div>
          );
        })}

        {/* Custom editable texts - positioned absolutely over the game canvas */}
        {responsiveTexts.map((text) => {
          const textProps = getPropertiesForDevice(text, device);
          const responsiveText = { ...text, ...textProps };
          
          return (
            <EditableText
              key={text.id}
              text={responsiveText}
              onUpdate={onTextUpdate}
              onDelete={onTextDelete}
              isSelected={selectedTextId === text.id}
              onSelect={setSelectedTextId}
              triggerAutoSync={triggerAutoSync}
            />
          );
        })}
      </BackgroundContainer>
    </div>
  );
};

export default Mode2Preview;

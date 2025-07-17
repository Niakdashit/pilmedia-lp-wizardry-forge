import React, { useState } from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../QualifioEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import SocialButtons from './SocialButtons';
import RulesButton from './RulesButton';
import GameRenderer from './GameRenderer';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';

interface Mode2PreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onTextUpdate: (updatedText: CustomText) => void;
  onTextDelete: (textId: string) => void;
  onImageUpdate: (updatedImage: any) => void;
  onImageDelete: (imageId: number) => void;
  onContainerClick: () => void;
}

const Mode2Preview: React.FC<Mode2PreviewProps> = ({ 
  device, 
  config, 
  onTextUpdate, 
  onTextDelete,
  onImageUpdate,
  onImageDelete,
  onContainerClick 
}) => {
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const handleContainerClick = () => {
    setSelectedTextId(null);
    setSelectedImageId(null);
    onContainerClick();
  };
  return (
    <BackgroundContainer
      device={device}
      config={config}
      onClick={handleContainerClick}
      className="overflow-hidden relative"
    >
      {/* Boutons positionnés en haut de la zone d'aperçu, en dessous de la barre de statut */}
      <div className="absolute top-12 left-4 z-10">
        <SocialButtons />
      </div>
      <div className="absolute top-12 right-4 z-10">
        <RulesButton />
      </div>
      
      <GameRenderer 
        gameType={config.gameType} 
        config={config} 
        device={device} 
      />
      
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
            />
          </div>
        </div>
      ))}
    </BackgroundContainer>
  );
};

export default Mode2Preview;
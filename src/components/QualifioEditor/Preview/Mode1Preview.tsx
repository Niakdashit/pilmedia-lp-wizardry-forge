
import React, { useState } from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../QualifioEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import SocialButtons from './SocialButtons';
import RulesButton from './RulesButton';
import ContentArea from './ContentArea';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';

interface Mode1PreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onTextUpdate: (updatedText: CustomText) => void;
  onTextDelete: (textId: string) => void;
  onImageUpdate: (updatedImage: any) => void;
  onImageDelete: (imageId: string) => void;
  onContainerClick: () => void;
}

const Mode1Preview: React.FC<Mode1PreviewProps> = ({ 
  device, 
  config, 
  onTextUpdate, 
  onTextDelete,
  onImageUpdate,
  onImageDelete,
  onContainerClick 
}) => {
  const [wheelResult, setWheelResult] = useState<{
    id: string;
    label: string;
    color: string;
  } | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleWheelResult = (result: { id: string; label: string; color: string }) => {
    console.log('Résultat de la roue:', result);
    setWheelResult(result);
  };

  const handleWheelResultClose = () => {
    setWheelResult(null);
  };

  const handleContainerClick = () => {
    setSelectedTextId(null);
    setSelectedImageId(null);
    onContainerClick();
  };

  // Calcul des hauteurs selon l'appareil
  const getHeaderHeight = () => {
    switch (device) {
      case 'mobile':
        return '50vh';
      case 'tablet':
        return '45vh';
      case 'desktop':
      default:
        return 'auto'; // Changé pour permettre la hauteur automatique basée sur l'image
    }
  };

  return (
    <div 
      className="w-full flex flex-col relative"
      style={{ 
        backgroundColor: '#ffffff'
      }}
      onClick={handleContainerClick}
    >
      {/* Bande blanche pour les boutons sociaux et règlement */}
      <div className="w-full bg-white py-2 px-4 flex justify-between items-center border-b border-gray-100">
        <SocialButtons />
        <RulesButton />
      </div>

      {/* Header avec image de fond - hauteur responsive */}
      <div style={{ height: getHeaderHeight() }}>
        <BackgroundContainer
          device={device}
          config={config}
          className="w-full h-full"
          isMode1={true}
        >
          {null}
        </BackgroundContainer>
      </div>

      {/* Content zone - connecté directement à la bannière */}
      <ContentArea 
        config={config} 
        isMode1={true}
        device={device}
        wheelResult={wheelResult}
        onWheelResultClose={handleWheelResultClose}
        onWheelResult={handleWheelResult}
      />
      
      {/* Custom editable images - positioned absolutely over the whole layout */}
      {config.design?.customImages?.map((image: any) => (
        <div
          key={image.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 9 }}
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
          style={{ zIndex: 10 }}
        >
          <div className="relative w-full h-full pointer-events-auto">
            <EditableText
              text={text}
              onUpdate={onTextUpdate}
              onDelete={onTextDelete}
              isSelected={selectedTextId === text.id}
              onSelect={setSelectedTextId}
              device={device}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Mode1Preview;

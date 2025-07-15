
import React, { useState } from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../QualifioEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import SocialButtons from './SocialButtons';
import RulesButton from './RulesButton';
import ContentArea from './ContentArea';
import EditableText from '../EditableText';

interface Mode1PreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onTextUpdate: (updatedText: CustomText) => void;
  onTextDelete: (textId: string) => void;
  onContainerClick: () => void;
}

const Mode1Preview: React.FC<Mode1PreviewProps> = ({ 
  device, 
  config, 
  onTextUpdate, 
  onTextDelete,
  onContainerClick 
}) => {
  const [wheelResult, setWheelResult] = useState<{
    id: string;
    label: string;
    color: string;
  } | null>(null);

  const handleWheelResult = (result: { id: string; label: string; color: string }) => {
    console.log('Résultat de la roue:', result);
    setWheelResult(result);
  };

  const handleWheelResultClose = () => {
    setWheelResult(null);
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
      className="w-full flex flex-col"
      style={{ 
        backgroundColor: '#ffffff'
      }}
      onClick={onContainerClick}
    >
      {/* Header avec image de fond - hauteur responsive */}
      <div style={{ height: getHeaderHeight() }}>
        <BackgroundContainer
          device={device}
          config={config}
          className="w-full h-full"
          isMode1={true}
        >
          <SocialButtons />
          <RulesButton />
        </BackgroundContainer>
      </div>

      {/* Content zone - s'adapte automatiquement au contenu */}
      <div className="bg-white" style={{ marginTop: 0, paddingTop: 0 }}>
        <ContentArea 
          config={config} 
          isMode1={true}
          device={device}
          wheelResult={wheelResult}
          onWheelResultClose={handleWheelResultClose}
          onWheelResult={handleWheelResult}
        />
      </div>
      
      {/* Custom editable texts - positioned absolutely over the whole layout */}
      {config.customTexts?.map((text) => (
        <EditableText
          key={text.id}
          text={text}
          onUpdate={onTextUpdate}
          onDelete={onTextDelete}
          isSelected={false}
          onSelect={() => {}}
        />
      ))}
    </div>
  );
};

export default Mode1Preview;

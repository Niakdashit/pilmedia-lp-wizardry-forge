
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

  return (
    <div 
      className="flex flex-col relative"
      style={{ 
        backgroundColor: '#ffffff',
        width: '100%',
        minHeight: '100vh'
      }}
      onClick={onContainerClick}
    >
      {/* Header avec image de fond - hauteur fixe */}
      <BackgroundContainer
        device={device}
        config={config}
        className="flex-shrink-0"
        style={{
          height: device === 'mobile' ? '40vh' : device === 'tablet' ? '40vh' : '50vh'
        }}
      >
        <SocialButtons />
        <RulesButton />
      </BackgroundContainer>

      {/* Content zone avec gestion des états - s'adapte automatiquement au contenu */}
      <div className="flex-grow bg-white">
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

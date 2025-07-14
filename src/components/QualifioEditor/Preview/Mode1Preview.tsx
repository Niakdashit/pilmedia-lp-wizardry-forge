import React from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../QualifioEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import SocialButtons from './SocialButtons';
import RulesButton from './RulesButton';
import WheelContainer from './WheelContainer';
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
  return (
    <div 
      className="flex flex-col relative"
      style={{ 
        backgroundColor: '#ffffff',
        width: '100%',
        height: '100%'
      }}
      onClick={onContainerClick}
    >
      {/* Header avec image de fond */}
      <BackgroundContainer
        device={device}
        config={config}
        className="flex-shrink-0"
        style={{
          height: device === 'mobile' ? '50%' : device === 'tablet' ? '45%' : '60%'
        }}
      >
        <SocialButtons />
        <RulesButton />
        <WheelContainer device={device} config={config} isMode1={true} />
      </BackgroundContainer>

      {/* Content zone */}
      <ContentArea config={config} />
      
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
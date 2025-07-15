import React from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../QualifioEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import SocialButtons from './SocialButtons';
import RulesButton from './RulesButton';
import GameRenderer from './GameRenderer';
import EditableText from '../EditableText';

interface Mode2PreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onTextUpdate: (updatedText: CustomText) => void;
  onTextDelete: (textId: string) => void;
  onContainerClick: () => void;
}

const Mode2Preview: React.FC<Mode2PreviewProps> = ({ 
  device, 
  config, 
  onTextUpdate, 
  onTextDelete,
  onContainerClick 
}) => {
  return (
    <BackgroundContainer
      device={device}
      config={config}
      onClick={onContainerClick}
    >
      <SocialButtons />
      <RulesButton />
      <GameRenderer 
        gameType={config.gameType} 
        config={config} 
        device={device} 
      />
      
      {/* Custom editable texts */}
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
    </BackgroundContainer>
  );
};

export default Mode2Preview;
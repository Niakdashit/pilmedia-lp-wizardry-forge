
import React, { useState } from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../QualifioEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import WheelContainer from './WheelContainer';

interface Mode1PreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const Mode1Preview: React.FC<Mode1PreviewProps> = ({ 
  device, 
  config, 
  onConfigUpdate 
}) => {
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const handleTextUpdate = (updatedText: CustomText) => {
    const updatedTexts = config.customTexts?.map(text => 
      text.id === updatedText.id ? updatedText : text
    ) || [];
    onConfigUpdate({ customTexts: updatedTexts });
  };

  const handleTextDelete = (textId: string) => {
    const updatedTexts = config.customTexts?.filter(text => text.id !== textId) || [];
    onConfigUpdate({ customTexts: updatedTexts });
    setSelectedTextId(null);
  };

  const handleContainerClick = () => {
    setSelectedTextId(null);
  };

  return (
    <BackgroundContainer
      device={device}
      config={config}
      onClick={handleContainerClick}
      className="w-full h-full flex items-center justify-center"
      isMode1={true}
    >
      <div className="flex items-center justify-center w-full h-full">
        <WheelContainer
          device={device}
          config={config}
          isMode1={true}
          isVisible={true}
        />
      </div>
    </BackgroundContainer>
  );
};

export default Mode1Preview;

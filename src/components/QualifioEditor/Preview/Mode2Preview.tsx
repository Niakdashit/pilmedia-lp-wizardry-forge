import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  return (
    <motion.div
      transition={{ duration: 1, delay: 0.2 }}
    >
      <BackgroundContainer
        device={device}
        config={config}
        onClick={handleContainerClick}
        className="overflow-hidden relative"
      >
        {/* Boutons positionnés en haut de la zone d'aperçu, en dessous de la barre de statut */}
        <motion.div 
          className="absolute top-12 left-4 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <SocialButtons />
        </motion.div>
        <motion.div 
          className="absolute top-12 right-4 z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <RulesButton />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <GameRenderer 
            gameType={config.gameType} 
            config={config} 
            device={device} 
          />
        </motion.div>
        
        {/* Custom editable images - positioned absolutely over the whole layout */}
        {config.design?.customImages?.map((image: any, index) => (
          <motion.div
            key={image.id}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 19 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
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
          </motion.div>
        ))}

        {/* Custom editable texts - positioned absolutely over the whole layout */}
        {config.customTexts?.map((text, index) => (
          <motion.div
            key={text.id}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
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
          </motion.div>
        ))}
      </BackgroundContainer>
    </motion.div>
  );
};

export default Mode2Preview;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { DeviceType, EditorConfig, CustomText } from '../QualifioEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import SocialButtons from './SocialButtons';
import RulesButton from './RulesButton';
import ContentArea from './ContentArea';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';
import { gameVariants } from '../animations/variants';

interface Mode1PreviewProps {
  device: DeviceType;
  config: EditorConfig;
  onTextUpdate: (updatedText: CustomText) => void;
  onTextDelete: (textId: string) => void;
  onImageUpdate: (updatedImage: any) => void;
  onImageDelete: (imageId: string) => void;
  onContainerClick?: () => void;
  triggerAutoSync?: () => void;
}

const Mode1Preview: React.FC<Mode1PreviewProps> = ({
  device,
  config,
  onTextUpdate,
  onTextDelete,
  onImageUpdate,
  onImageDelete,
  onContainerClick,
  triggerAutoSync
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
    if (onContainerClick) {
      onContainerClick();
    }
  };

  return (
    <motion.div 
      className="w-full h-full relative"
      style={{ 
        backgroundColor: '#ffffff'
      }}
      onClick={handleContainerClick}
      variants={gameVariants.entrance as any}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* BackgroundContainer qui remplit tout l'espace pour mobile/tablette */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <BackgroundContainer
          device={device}
          config={config}
          className="w-full h-full"
          isMode1={true}
        />
      </motion.div>

      {/* Barre des boutons sociaux et règlement - positionnée par-dessus l'image */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm py-2 px-4 flex justify-between items-center border-b border-gray-100/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SocialButtons />
        <RulesButton />
      </motion.div>

      {/* Content zone positionnée par-dessus l'image */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <ContentArea 
          config={config} 
          isMode1={true}
          device={device}
          wheelResult={wheelResult}
          onWheelResultClose={handleWheelResultClose}
          onWheelResult={handleWheelResult}
        />
      </motion.div>
      
      {/* Custom editable images - positioned absolutely over the whole layout */}
      {config.design?.customImages?.map((image: any, index) => (
        <motion.div
          key={image.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
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
          style={{ zIndex: 10 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
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
    </motion.div>
  );
};

export default Mode1Preview;

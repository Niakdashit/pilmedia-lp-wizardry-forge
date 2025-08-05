import React, { useState, useMemo, useEffect } from 'react';
import type { DeviceType, EditorConfig, CustomText } from '../GameEditorLayout';
import BackgroundContainer from './BackgroundContainer';
import SocialButtons from './SocialButtons';
import RulesButton from './RulesButton';
import ContentArea from './ContentArea';
import EditableText from '../EditableText';
import EditableImage from '../EditableImage';
import { useUniversalResponsive } from '../../../hooks/useUniversalResponsive';
import { useBrandColorExtraction } from '../../QuickCampaign/Preview/hooks/useBrandColorExtraction';
import { synchronizeCampaignWithColors } from '../../QuickCampaign/Preview/utils/campaignSynchronizer';

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
  const [synchronizedConfig, setSynchronizedConfig] = useState(config);

  // Extraction automatique des couleurs de l'image de fond
  const customColors = useMemo(() => ({
    primary: config.participateButtonColor || '#841b60',
    secondary: config.outlineColor || '#dc2626', 
    accent: config.backgroundColor || '#10b981'
  }), [config.participateButtonColor, config.outlineColor, config.backgroundColor]);

  const { finalColors, brandStyleExtracted } = useBrandColorExtraction(
    customColors,
    config.bannerImage
  );

  // Synchroniser la configuration avec les couleurs extraites
  useEffect(() => {
    if (brandStyleExtracted && finalColors) {
      const updatedConfig = synchronizeCampaignWithColors(
        config,
        finalColors
      );
      setSynchronizedConfig(updatedConfig as any);
    } else {
      setSynchronizedConfig(config);
    }
  }, [config, finalColors, brandStyleExtracted]);

  // Système responsif unifié - utiliser le device courant comme base
  const { applyAutoResponsive, getPropertiesForDevice } = useUniversalResponsive('desktop');

  // Convertir les textes en format responsif - utiliser la config synchronisée
  const responsiveTexts = useMemo(() => {
    if (!synchronizedConfig.customTexts) return [];
    const convertedTexts = synchronizedConfig.customTexts.map(text => ({
      ...text,
      type: 'text' as const,
      x: text.x || 0,
      y: text.y || 0,
      fontSize: text.fontSize || 16,
      textAlign: (text.textAlign || 'left') as 'left' | 'center' | 'right'
    }));
    return applyAutoResponsive(convertedTexts);
  }, [synchronizedConfig.customTexts, applyAutoResponsive]);

  // Convertir les images en format responsif - utiliser la config synchronisée
  const responsiveImages = useMemo(() => {
    if (!synchronizedConfig.design?.customImages) return [];
    const convertedImages = synchronizedConfig.design.customImages.map(image => ({
      ...image,
      type: 'image' as const,
      x: image.x || 0,
      y: image.y || 0,
      width: image.width || 150,
      height: image.height || 150
    }));
    return applyAutoResponsive(convertedImages);
  }, [synchronizedConfig.design?.customImages, applyAutoResponsive]);

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
      <div 
        className="w-full bg-white py-2 px-4 flex justify-between items-center border-b border-gray-100"
      >
        <SocialButtons />
        <RulesButton />
      </div>

      {/* Header avec image de fond - hauteur responsive */}
      <div 
        style={{ height: getHeaderHeight() }}
      >
        <BackgroundContainer
          device={device}
          config={synchronizedConfig}
          className="w-full h-full"
          isMode1={true}
        >
          {null}
        </BackgroundContainer>
      </div>

      {/* Content zone - connecté directement à la bannière */}
      <div>
        <ContentArea 
          config={synchronizedConfig} 
          isMode1={true}
          device={device}
          wheelResult={wheelResult}
          onWheelResultClose={handleWheelResultClose}
          onWheelResult={handleWheelResult}
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
            style={{ zIndex: 9 }}
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

      {/* Custom editable texts - only render in header area for Mode 1, not over content area */}
      {responsiveTexts.map((text) => {
        const textProps = getPropertiesForDevice(text, device);
        const responsiveText = { ...text, ...textProps };
        
        return (
          <div
            key={text.id}
            className="absolute pointer-events-none"
            style={{ 
              zIndex: 10,
              top: 0,
              left: 0,
              width: '100%',
              height: getHeaderHeight() === 'auto' ? '70vh' : getHeaderHeight()
            }}
          >
            <div className="relative w-full h-full">
              <EditableText
                text={responsiveText}
                onUpdate={onTextUpdate}
                onDelete={onTextDelete}
                isSelected={selectedTextId === text.id}
                onSelect={setSelectedTextId}
                triggerAutoSync={triggerAutoSync}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Mode1Preview;

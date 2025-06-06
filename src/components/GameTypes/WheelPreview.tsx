import React, { useState } from 'react';
import ValidationMessage from '../common/ValidationMessage';
import { useParticipations } from '../../hooks/useParticipations';
import { useGameSize } from '../../hooks/useGameSize';
import { useWheelSpin } from '../../hooks/useWheelSpin';
import WheelCanvas from './WheelComponents/WheelCanvas';
import WheelPointer from './WheelComponents/WheelPointer';
import WheelButton from './WheelComponents/WheelButton';
import WheelDecorations from './WheelComponents/WheelDecorations';
import WheelContainer from './WheelComponents/WheelContainer';
import WheelFormModal from './WheelComponents/WheelFormModal';
import WheelInteractionHandler from './WheelComponents/WheelInteractionHandler';
import { DEFAULT_FIELDS, getWheelSegments, getWheelDimensions } from '../../utils/wheelConfig';

interface InstantWinConfig {
  mode: "instant_winner";
  winProbability: number;
  maxWinners?: number;
  winnersCount?: number;
}

interface WheelPreviewProps {
  campaign: any;
  config: InstantWinConfig;
  onFinish?: (result: 'win' | 'lose') => void;
  disabled?: boolean;
  onStart?: () => void;
  gameSize?: 'small' | 'medium' | 'large' | 'xlarge';
  gamePosition?: 'top' | 'center' | 'bottom' | 'left' | 'right';
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const WheelPreview: React.FC<WheelPreviewProps> = ({
  campaign,
  config,
  onFinish,
  disabled = false,
  onStart,
  gameSize = 'small',
  gamePosition = 'center',
  previewDevice = 'desktop'
}) => {
  const position = campaign?.config?.roulette?.position || 'centre';
  const segments = getWheelSegments(campaign);
  
  const centerImage = campaign?.config?.roulette?.centerImage;
  const centerLogo = campaign?.design?.centerLogo || campaign?.config?.roulette?.centerImage;
  const theme = campaign?.config?.roulette?.theme || 'default';
  
  const borderColor = campaign?.config?.roulette?.borderColor || '#841b60';
  const borderOutlineColor = campaign?.config?.roulette?.borderOutlineColor || '#FFD700';
  
  const customColors = campaign?.design?.customColors;
  
  const buttonConfig = campaign?.buttonConfig || {
    color: customColors?.primary || '#841b60',
    borderColor: customColors?.primary || '#841b60',
    borderWidth: 1,
    borderRadius: 8,
    size: 'medium',
    link: '',
    visible: true,
    text: 'Remplir le formulaire'
  };
  
  const [formValidated, setFormValidated] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();
  
  const isMobile = previewDevice === 'mobile';
  const isCroppablePosition = ['left', 'right', 'bottom'].includes(gamePosition);
  const shouldCropWheel = isMobile && isCroppablePosition;
  
  const { canvasSize, containerWidth, pointerSize } = getWheelDimensions(
    gameDimensions,
    gamePosition,
    shouldCropWheel
  );

  const { rotation, spinning, spinWheel } = useWheelSpin({
    segments,
    disabled,
    config,
    onStart,
    onFinish
  });

  const {
    createParticipation,
    loading: participationLoading
  } = useParticipations();

  const fields = Array.isArray(campaign.formFields) && campaign.formFields.length > 0
    ? campaign.formFields : DEFAULT_FIELDS;

  const handleFormSubmit = async (formData: Record<string, string>) => {
    if (campaign.id) {
      await createParticipation({
        campaign_id: campaign.id,
        form_data: formData,
        user_email: formData.email
      });
    }
    setShowFormModal(false);
    setFormValidated(true);
    setShowValidationMessage(true);
    setTimeout(() => setShowValidationMessage(false), 1500);
  };

  const handleWheelClick = () => {
    if (buttonConfig.link && !formValidated) {
      window.open(buttonConfig.link, '_blank');
      return;
    }

    if (!formValidated) {
      setShowFormModal(true);
      return;
    }
    spinWheel();
  };

  if (segments.length === 0) {
    return (
      <WheelContainer 
        gamePosition={gamePosition} 
        gameDimensions={gameDimensions}
        previewDevice={previewDevice}
      >
        <p>Aucun segment configuré pour la roue</p>
      </WheelContainer>
    );
  }

  return (
    <WheelContainer 
      gamePosition={gamePosition} 
      gameDimensions={gameDimensions}
      previewDevice={previewDevice}
    >
      <div style={{ 
        position: 'relative', 
        width: containerWidth, 
        height: canvasSize,
        overflow: shouldCropWheel ? 'hidden' : 'visible'
      }}>
        {/* Ombre réduite */}
        <div 
          style={{
            position: 'absolute',
            width: canvasSize - 15,
            height: canvasSize - 15,
            left:
              shouldCropWheel && gamePosition === 'right'
                ? `-${canvasSize * 0.5 + 8}px`
                : '8px',
            top: '12px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.05) 50%, rgba(0,0,0,0.1) 100%)',
            filter: 'blur(10px)',
            zIndex: 0
          }}
        />
        
        <WheelInteractionHandler
          formValidated={formValidated}
          onWheelClick={handleWheelClick}
        >
          <WheelCanvas
            segments={segments}
            rotation={rotation}
            centerImage={centerImage}
            centerLogo={centerLogo}
            theme={theme}
            customColors={customColors}
            borderColor={borderColor}
            borderOutlineColor={borderOutlineColor}
            canvasSize={canvasSize}
            offset={
              shouldCropWheel && gamePosition === 'left'
                ? `-${canvasSize * 0.5}px`
                : '0px'
            }
            position={position}
          />
          
          <WheelDecorations
            theme={theme}
            canvasSize={canvasSize}
            shouldCropWheel={shouldCropWheel}
            gamePosition={gamePosition}
          />
          
          <WheelPointer
            canvasSize={canvasSize}
            shouldCropWheel={shouldCropWheel}
            gamePosition={gamePosition}
            pointerSize={pointerSize}
          />
        </WheelInteractionHandler>

        <ValidationMessage
          show={showValidationMessage}
          message="Formulaire validé ! Vous pouvez maintenant jouer."
          type="success"
        />
      </div>

      <WheelButton
        buttonConfig={buttonConfig}
        spinning={spinning}
        disabled={disabled}
        formValidated={formValidated}
        onClick={handleWheelClick}
      />

      <WheelFormModal
        showFormModal={showFormModal}
        onClose={() => setShowFormModal(false)}
        campaign={campaign}
        fields={fields}
        participationLoading={participationLoading}
        onSubmit={handleFormSubmit}
      />
    </WheelContainer>
  );
};

export default WheelPreview;

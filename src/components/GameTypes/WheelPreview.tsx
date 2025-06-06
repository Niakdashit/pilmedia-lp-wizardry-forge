import React, { useState } from 'react';
import Modal from '../common/Modal';
import ValidationMessage from '../common/ValidationMessage';
import DynamicContactForm, { FieldConfig } from '../forms/DynamicContactForm';
import { useParticipations } from '../../hooks/useParticipations';
import { useGameSize } from '../../hooks/useGameSize';
import WheelCanvas from './WheelComponents/WheelCanvas';
import WheelPointer from './WheelComponents/WheelPointer';
import WheelButton from './WheelComponents/WheelButton';
import WheelDecorations from './WheelComponents/WheelDecorations';
import WheelContainer from './WheelComponents/WheelContainer';

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

const DEFAULT_FIELDS: FieldConfig[] = [
  { id: "civilite", label: "Civilité", type: "select", options: ["M.", "Mme"], required: false },
  { id: "prenom", label: "Prénom", required: true },
  { id: "nom", label: "Nom", required: true },
  { id: "email", label: "Email", type: "email", required: true }
];

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
  // Récupérer les couleurs des segments depuis la configuration
  const segmentColor1 = campaign?.config?.roulette?.segmentColor1 || '#ff6b6b';
  const segmentColor2 = campaign?.config?.roulette?.segmentColor2 || '#4ecdc4';
  
  // Appliquer les couleurs alternées aux segments
  const originalSegments = campaign?.config?.roulette?.segments || [];
  const segments = originalSegments.map((segment: any, index: number) => ({
    ...segment,
    color: index % 2 === 0 ? segmentColor1 : segmentColor2
  }));
  
  const centerImage = campaign?.config?.roulette?.centerImage;
  // Prioriser centerLogo du design, puis centerImage de la config
  const centerLogo = campaign?.design?.centerLogo || campaign?.config?.roulette?.centerImage;
  const theme = campaign?.config?.roulette?.theme || 'default';
  
  // Récupérer les couleurs de bordure personnalisées
  const borderColor = campaign?.config?.roulette?.borderColor || '#841b60';
  const borderOutlineColor = campaign?.config?.roulette?.borderOutlineColor || '#FFD700';
  
  // Utiliser les couleurs personnalisées du store QuickCampaign ou valeurs par défaut
  const customColors = campaign?.design?.customColors;
  
  // Get button configuration from campaign with custom colors
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
  
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [formValidated, setFormValidated] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  const { getGameDimensions } = useGameSize(gameSize);
  const gameDimensions = getGameDimensions();
  
  // Determine if the wheel should be cropped on mobile for specific positions
  const isMobile = previewDevice === 'mobile';
  const isCroppablePosition = ['left', 'right', 'bottom'].includes(gamePosition);
  const shouldCropWheel = isMobile && isCroppablePosition;
  
  // Adjust canvas and container sizes for cropping
  const baseCanvasSize = Math.min(gameDimensions.width, gameDimensions.height) - 60;
  const canvasSize = baseCanvasSize;
  const containerWidth =
    shouldCropWheel && (gamePosition === 'left' || gamePosition === 'right')
      ? baseCanvasSize * 0.5
      : baseCanvasSize;
  
  // Taille du pointeur proportionnelle
  const pointerSize = Math.max(30, canvasSize * 0.08);

  const {
    createParticipation,
    loading: participationLoading
  } = useParticipations();

  const fields: FieldConfig[] = Array.isArray(campaign.formFields) && campaign.formFields.length > 0
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

  const spinWheel = () => {
    if (spinning || segments.length === 0 || disabled) return;
    setSpinning(true);

    if (onStart) onStart();

    const totalSpins = 5;
    const randomOffset = Math.random() * 360;
    const finalRotationDeg = totalSpins * 360 + randomOffset;
    const finalRotation = (finalRotationDeg * Math.PI) / 180;

    const duration = 4500;
    const start = Date.now();
    const initialRotation = rotation;

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    const animate = () => {
      const now = Date.now();
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const easedT = easeOutCubic(t);
      const current = initialRotation + easedT * (finalRotation - initialRotation);
      setRotation(current);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setRotation(current % (2 * Math.PI));
        let result: 'win' | 'lose' = 'lose';
        if (
          config.mode === 'instant_winner' &&
          (!config.maxWinners || (config.winnersCount ?? 0) < config.maxWinners)
        ) {
          result = Math.random() < (config.winProbability ?? 0) ? 'win' : 'lose';
        }
        if (typeof onFinish === 'function') onFinish(result);
      }
    };
    animate();
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
            width: canvasSize - 15, // Réduit de 10 à 15
            height: canvasSize - 15,
            left:
              shouldCropWheel && gamePosition === 'right'
                ? `-${canvasSize * 0.5 + 8}px`
                : '8px',
            top: '12px', // Légèrement augmenté pour moins d'ombre
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.05) 50%, rgba(0,0,0,0.1) 100%)', // Réduit l'opacité
            filter: 'blur(10px)', // Réduit le blur de 15 à 10
            zIndex: 0
          }}
        />
        
        {/* Canvas avec images dynamiques */}
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
          offset={shouldCropWheel && gamePosition === 'right' ? `-${canvasSize * 0.5}px` : '0px'}
        />
        
        {/* Theme decoration */}
        <WheelDecorations
          theme={theme}
          canvasSize={canvasSize}
          shouldCropWheel={shouldCropWheel}
          gamePosition={gamePosition}
        />
        
        {/* Enhanced Pointer with golden styling */}
        <WheelPointer
          canvasSize={canvasSize}
          shouldCropWheel={shouldCropWheel}
          gamePosition={gamePosition}
          pointerSize={pointerSize}
        />

        {/* Click overlay for non-validated form */}
        {!formValidated && (
          <div 
            onClick={handleWheelClick}
            className="absolute inset-0 flex items-center justify-center z-30 rounded-full cursor-pointer bg-black/0" 
          />
        )}

        <ValidationMessage
          show={showValidationMessage}
          message="Formulaire validé ! Vous pouvez maintenant jouer."
          type="success"
        />
      </div>

      {/* Enhanced button with golden styling */}
      <WheelButton
        buttonConfig={buttonConfig}
        spinning={spinning}
        disabled={disabled}
        formValidated={formValidated}
        onClick={handleWheelClick}
      />

      {/* Form modal */}
      {showFormModal && (
        <Modal
          onClose={() => setShowFormModal(false)}
          title={campaign.screens?.[1]?.title || 'Vos informations'}
          contained={true}
        >
          <DynamicContactForm
            fields={fields}
            submitLabel={participationLoading ? 'Chargement...' : campaign.screens?.[1]?.buttonText || "C'est parti !"}
            onSubmit={handleFormSubmit}
          />
        </Modal>
      )}
    </WheelContainer>
  );
};

export default WheelPreview;


import React, { useMemo } from 'react';
import WheelContainer from './WheelComponents/WheelContainer';
import WheelButton from './WheelComponents/WheelButton';
import WheelFormModal from './WheelComponents/WheelFormModal';
import WheelPreviewContent from './WheelComponents/WheelPreviewContent';
import { useWheelPreviewLogic } from './WheelComponents/WheelPreviewLogic';
import { getWheelPreviewConfig } from './WheelComponents/WheelPreviewConfig';

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
  disableForm?: boolean;
}

const WheelPreview: React.FC<WheelPreviewProps> = ({
  campaign,
  config,
  onFinish,
  disabled = false,
  onStart,
  gameSize = 'small',
  gamePosition = 'center',
  previewDevice = 'desktop',
  disableForm = false
}) => {
  const {
    formValidated,
    showFormModal,
    setShowFormModal,
    showValidationMessage,
    canvasSize,
    containerWidth,
    containerHeight,
    segments,
    rotation,
    spinning,
    fields,
    participationLoading,
    handleFormSubmit,
    handleWheelClick
  } = useWheelPreviewLogic({
    campaign,
    config,
    onFinish,
    disabled,
    onStart,
    gameSize,
    gamePosition,
    previewDevice,
    disableForm
  });

  const {
    centerImage,
    centerLogo,
    theme,
    borderColor,
    borderOutlineColor,
    customColors,
    buttonConfig
  } = getWheelPreviewConfig(campaign);

  // Calculer dynamiquement si on doit afficher le message d'absence de segments
  const hasNoConfiguredSegments = useMemo(() => {
    const segmentCount = segments?.length || 0;
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreview - Nombre de segments:', segmentCount);
    }
    return segmentCount === 0;
  }, [segments]);

  // Debug des segments
  if (process.env.NODE_ENV !== 'production') {
    console.log('WheelPreview - Segments reçus:', segments);
    console.log('WheelPreview - hasNoConfiguredSegments:', hasNoConfiguredSegments);
    console.log('WheelPreview - formValidated:', formValidated);
    console.log('WheelPreview - disableForm:', disableForm);
  }

  // Gestion du clic sur le bouton - logique simplifiée
  const handleButtonClick = () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreview - Bouton cliqué, formValidated:', formValidated, 'disableForm:', disableForm);
    }
    
    // Si le formulaire est désactivé, on valide automatiquement
    if (disableForm) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('WheelPreview - Formulaire désactivé, lancement direct');
      }
      handleWheelClick();
      return;
    }

    // Si le formulaire n'est pas validé, on affiche la modale
    if (!formValidated) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('WheelPreview - Formulaire non validé, ouverture de la modale');
      }
      setShowFormModal(true);
      return;
    }

    // Si le formulaire est validé, on lance la roue
    if (process.env.NODE_ENV !== 'production') {
      console.log('WheelPreview - Formulaire validé, lancement de la roue');
    }
    handleWheelClick();
  };

  return (
    <WheelContainer previewDevice={previewDevice}>
      {hasNoConfiguredSegments && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 text-gray-600 text-center p-4">
          Ajoutez des segments pour activer la roue
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="flex-1 flex items-center justify-center">
          <WheelPreviewContent
            segments={segments}
            rotation={rotation}
            spinning={spinning}
            centerImage={centerImage}
            centerLogo={centerLogo}
            theme={theme}
            customColors={customColors}
            borderColor={borderColor}
            borderOutlineColor={borderOutlineColor}
            canvasSize={canvasSize}
            showValidationMessage={showValidationMessage}
            onWheelClick={handleButtonClick}
          />
        </div>

        <div className="flex-shrink-0 pb-4">
          <WheelButton
            buttonConfig={buttonConfig}
            spinning={spinning}
            disabled={disabled || hasNoConfiguredSegments}
            formValidated={formValidated}
            onClick={handleButtonClick}
          />
        </div>
      </div>

      {!disableForm && (
        <WheelFormModal
          showFormModal={showFormModal}
          onClose={() => setShowFormModal(false)}
          campaign={campaign}
          fields={fields}
          participationLoading={participationLoading}
          onSubmit={handleFormSubmit}
        />
      )}
    </WheelContainer>
  );
};

export default WheelPreview;

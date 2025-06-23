
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
  /** Control display of the radial shadow under the wheel */
  showShadow?: boolean;
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
  disableForm = false,
  showShadow = true
}) => {
  const {
    formValidated,
    showFormModal,
    setShowFormModal,
    showValidationMessage,
    gameDimensions,
    shouldCropWheel,
    canvasSize,
    containerWidth,
    containerHeight,
    pointerSize,
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
    console.log('WheelPreview - Nombre de segments:', segmentCount);
    return segmentCount === 0;
  }, [segments]);

  // Debug des segments
  console.log('WheelPreview - Segments reçus:', segments);
  console.log('WheelPreview - hasNoConfiguredSegments:', hasNoConfiguredSegments);

  return (
    <WheelContainer
      gameDimensions={gameDimensions}
      previewDevice={previewDevice}
    >
      {hasNoConfiguredSegments && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 text-gray-600 text-center p-4">
          Ajoutez des segments pour activer la roue
        </div>
      )}
      <div className="flex flex-col items-center justify-center space-y-6 w-full h-full">
        <div className="flex-shrink-0">
          <WheelPreviewContent
            segments={segments}
            rotation={rotation}
            centerImage={centerImage}
            centerLogo={centerLogo}
            theme={theme}
            customColors={customColors}
            borderColor={borderColor}
            borderOutlineColor={borderOutlineColor}
            canvasSize={canvasSize}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
            pointerSize={pointerSize}
            shouldCropWheel={shouldCropWheel}
            gamePosition={gamePosition}
            formValidated={formValidated}
            showValidationMessage={showValidationMessage}
            onWheelClick={handleWheelClick}
            showShadow={showShadow}
          />
        </div>

        <div className="flex-shrink-0">
          <WheelButton
            buttonConfig={buttonConfig}
            spinning={spinning}
            disabled={disabled || hasNoConfiguredSegments}
            formValidated={formValidated}
            onClick={handleWheelClick}
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

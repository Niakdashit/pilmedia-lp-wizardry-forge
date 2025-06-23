
import React, { useMemo } from 'react';
import WheelContainer from './WheelComponents/WheelContainer';
import WheelButton from './WheelComponents/WheelButton';
import WheelFormModal from './WheelComponents/WheelFormModal';
import WheelPreviewContent from './WheelComponents/WheelPreviewContent';
import WheelErrorBoundary from './WheelComponents/WheelErrorBoundary';
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

  // Debug des segments avec validation supplémentaire
  console.log('WheelPreview - Segments reçus:', segments);
  console.log('WheelPreview - hasNoConfiguredSegments:', hasNoConfiguredSegments);

  // SÉCURITÉ: Vérifier qu'aucun segment ne contient de données corrompues
  const hasCorruptedData = useMemo(() => {
    if (!segments || segments.length === 0) return false;
    
    return segments.some(segment => {
      // Détecter des chaînes suspectes (très longues, encodage base64, etc.)
      if (segment.label && typeof segment.label === 'string') {
        if (segment.label.length > 100 || /^[A-Za-z0-9+/=]{50,}$/.test(segment.label)) {
          console.error('Données corrompues détectées dans le label:', segment.label.substring(0, 100));
          return true;
        }
      }
      
      if (segment.image && typeof segment.image === 'string') {
        if (segment.image.length > 500 && !segment.image.startsWith('data:image/')) {
          console.error('Image corrompue détectée:', segment.image.substring(0, 100));
          return true;
        }
      }
      
      return false;
    });
  }, [segments]);

  // Si des données corrompues sont détectées, afficher un message d'erreur
  if (hasCorruptedData) {
    return (
      <WheelContainer
        gameDimensions={gameDimensions}
        previewDevice={previewDevice}
      >
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 text-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Données corrompues détectées
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Des données invalides ont été détectées dans la configuration de la roue. 
              Veuillez vérifier les segments et leurs propriétés.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </WheelContainer>
    );
  }

  return (
    <WheelErrorBoundary>
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
    </WheelErrorBoundary>
  );
};

export default WheelPreview;

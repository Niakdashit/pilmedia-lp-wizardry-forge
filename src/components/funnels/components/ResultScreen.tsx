
import React from 'react';
import ContrastBackground from '../../common/ContrastBackground';
import { useBrandTheme } from '../../../hooks/useBrandTheme';

interface ResultScreenProps {
  gameResult: 'win' | 'lose';
  campaign: any;
  mobileConfig?: any;
  onReset: () => void;
  launchButtonStyles?: React.CSSProperties;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  gameResult,
  campaign,
  mobileConfig,
  onReset,
  launchButtonStyles
}) => {
  const { primaryColor, accentColor } = useBrandTheme();
  const resultScreen = campaign.screens?.[3] || {};
  const contrastBg = mobileConfig?.contrastBackground || resultScreen.contrastBackground;
  
  // Utiliser les messages personnalisés depuis scratchResultMessages
  const customMessages = campaign.scratchResultMessages;
  
  // Mode neutre pour les campagnes formulaire: message de confirmation sans notion de gain/perte
  const isNeutralConfirmation = Boolean(
    (campaign?.resultMessages && (campaign.resultMessages as any).confirmation)
    || (campaign?.type === 'form')
    || (campaign?.resultMode === 'confirmation')
  );
  const neutralConfig = {
    title: 'Merci !',
    message: 'Votre participation a été enregistrée.',
    subMessage: 'Vous recevrez une confirmation par email.',
    buttonText: 'Fermer',
    buttonAction: 'close' as const,
    showPrizeImage: false
  };

  const winnerConfig = customMessages?.winner || {
    title: '🎉 Félicitations !',
    message: 'Vous avez gagné !',
    subMessage: 'Un email de confirmation vous a été envoyé',
    buttonText: 'Fermer',
    buttonAction: 'close',
    showPrizeImage: true
  };
  const loserConfig = customMessages?.loser || {
    title: 'Dommage ! Tentez votre chance une prochaine fois.',
    message: 'Merci pour votre participation !',
    subMessage: '',
    buttonText: 'Rejouer',
    buttonAction: 'replay'
  };

  const currentConfig = isNeutralConfirmation
    ? (campaign?.resultMessages?.confirmation || neutralConfig)
    : (gameResult === 'win' ? winnerConfig : loserConfig);

  

  // Always show the message in a centered framed card (force 2px radius)
  const frameConfig = contrastBg && typeof contrastBg === 'object'
    ? {
        color: contrastBg.color,
        opacity: contrastBg.opacity,
        padding: contrastBg.padding ?? 24,
        borderRadius: 2
      }
    : {
        color: 'rgba(255,255,255,0.9)',
        opacity: 90,
        padding: 24,
        borderRadius: 2
      };

  const handleButtonClick = () => {
    if (currentConfig.buttonAction === 'replay') {
      onReset();
    } else if (currentConfig.buttonAction === 'redirect' && currentConfig.redirectUrl) {
      window.location.href = currentConfig.redirectUrl;
    } else if (currentConfig.buttonAction === 'close') {
      window.close();
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUpFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        className="w-full h-full flex items-center justify-center p-4"
        style={{
          animation: 'slideUpFromBottom 0.5s ease-out forwards'
        }}
      >
        <ContrastBackground
          enabled={true}
          config={frameConfig}
          className="text-center space-y-4 w-full max-w-lg"
        >
        <div
          className="space-y-3 rounded"
          style={{
            backgroundColor: campaign?.design?.formConfig?.panelBg || '#ffffff',
            borderRadius: typeof campaign?.design?.formConfig?.borderRadius === 'number'
              ? `${campaign?.design?.formConfig?.borderRadius}px`
              : '12px',
            border: `1px solid ${campaign?.design?.formConfig?.borderColor || 'rgba(0,0,0,0.05)'}`,
            padding: 24
          }}
        >
          {/* Optional prize image for winners */}
          {gameResult === 'win' && currentConfig.showPrizeImage && (
            <div className="w-full flex items-center justify-center pb-2">
              {(
                (currentConfig as any).prizeImageUrl ||
                campaign?.prizeImage?.value ||
                campaign?.images?.prize
              ) ? (
                <img
                  src={(currentConfig as any).prizeImageUrl || campaign?.prizeImage?.value || campaign?.images?.prize}
                  alt="Prix gagné"
                  style={{
                    maxWidth: '220px',
                    maxHeight: '160px',
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 8,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7a4b00',
                    fontSize: 48,
                    boxShadow: '0 10px 24px rgba(0,0,0,0.15)'
                  }}
                >
                  🏆
                </div>
              )}
            </div>
          )}
          <h2
            className="text-2xl font-bold"
            style={{ color: campaign?.design?.formConfig?.textColor || '#111827' }}
          >
            {currentConfig.title}
          </h2>
          <p
            className="text-lg"
            style={{ color: campaign?.design?.formConfig?.textColor || '#374151' }}
          >
            {currentConfig.message}
          </p>
          {currentConfig.subMessage && (
            <p
              className="text-sm"
              style={{ color: campaign?.design?.formConfig?.textColor || '#6B7280' }}
            >
              {currentConfig.subMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-3 pt-4">
          <button 
            onClick={handleButtonClick}
            className="inline-flex items-center justify-center px-6 py-2 font-medium transition-colors"
            style={{
              ...launchButtonStyles,
              backgroundColor: campaign?.design?.formConfig?.buttonColor || launchButtonStyles?.backgroundColor || primaryColor || campaign?.design?.primaryColor || '#E0004D',
              color: campaign?.design?.formConfig?.buttonTextColor || launchButtonStyles?.color || accentColor || campaign?.design?.accentColor || '#ffffff',
              borderRadius: typeof campaign?.design?.formConfig?.borderRadius === 'number'
                ? `${campaign?.design?.formConfig?.borderRadius}px`
                : (launchButtonStyles?.borderRadius as string) || '12px'
            }}
          >
            {currentConfig.buttonText}
          </button>
        </div>
      </ContrastBackground>
      </div>
    </>
  );
};

export default ResultScreen;

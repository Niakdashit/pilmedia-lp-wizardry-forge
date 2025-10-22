
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

  const currentConfig = gameResult === 'win' ? winnerConfig : loserConfig;

  

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
    <div className="w-full h-full flex items-center justify-center p-4">
      <ContrastBackground
        enabled={true}
        config={frameConfig}
        className="text-center space-y-4 w-full max-w-lg rounded-[2px] border border-black/5"
      >
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentConfig.title}
          </h2>
          <p className="text-lg text-gray-600">
            {currentConfig.message}
          </p>
          {currentConfig.subMessage && (
            <p className="text-sm text-gray-500">
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
              ...(launchButtonStyles ? {} : {
                backgroundColor: primaryColor || campaign.design?.primaryColor || '#841b60',
                color: accentColor || campaign.design?.accentColor || '#ffffff',
                borderRadius: '2px'
              })
            }}
          >
            {currentConfig.buttonText}
          </button>
        </div>
      </ContrastBackground>
    </div>
  );
};

export default ResultScreen;


import React from 'react';
import ContrastBackground from '../../common/ContrastBackground';
import { useBrandTheme } from '../../../hooks/useBrandTheme';

interface ResultScreenProps {
  gameResult: 'win' | 'lose';
  campaign: any;
  mobileConfig?: any;
  onReset: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  gameResult,
  campaign,
  mobileConfig,
  onReset
}) => {
  const { primaryColor, accentColor } = useBrandTheme();
  const resultScreen = campaign.screens?.[3] || {};
  const contrastBg = mobileConfig?.contrastBackground || resultScreen.contrastBackground;
  
  const defaultWinMessage = "Félicitations ! Vous avez gagné !";
  const defaultLoseMessage = "Dommage ! Tentez votre chance une prochaine fois.";
  const defaultThankYouMessage = "Merci pour votre participation !";

  const winMessage = resultScreen?.winMessage || defaultWinMessage;
  const loseMessage = resultScreen?.loseMessage || defaultLoseMessage;
  const thankYouMessage = resultScreen?.description || defaultThankYouMessage;

  

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

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ContrastBackground
        enabled={true}
        config={frameConfig}
        className="text-center space-y-4 w-full max-w-lg rounded-[2px] border border-black/5"
      >
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {gameResult === 'win' ? winMessage : loseMessage}
          </h2>
          <p className="text-lg text-gray-600">
            {thankYouMessage}
          </p>
        </div>

        <div className="flex flex-col space-y-3 pt-4">
          {gameResult === 'win' && resultScreen?.ctaLink && (
            <a 
              href={resultScreen.ctaLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              {resultScreen?.ctaText || "Récupérer mon gain"}
            </a>
          )}
          
          <button 
            onClick={onReset} 
            className="inline-flex items-center justify-center px-6 py-2 font-medium rounded-[2px] transition-colors"
            style={{
              backgroundColor: primaryColor || campaign.design?.primaryColor || '#d4dbe8',
              color: accentColor || campaign.design?.accentColor || '#ffffff'
            }}
          >
            {resultScreen?.replayButtonText || 'Rejouer'}
          </button>

          {resultScreen?.secondaryCtaLink && (
            <a 
              href={resultScreen.secondaryCtaLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm underline hover:opacity-80"
              style={{ color: campaign.design?.primaryColor || '#d4dbe8' }}
            >
              {resultScreen?.secondaryCtaText || "Découvrir nos offres"}
            </a>
          )}
        </div>
      </ContrastBackground>
    </div>
  );
};

export default ResultScreen;

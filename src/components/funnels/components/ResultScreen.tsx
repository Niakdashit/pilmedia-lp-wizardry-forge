
import React from 'react';
import ContrastBackground from '../../common/ContrastBackground';

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
  const resultScreen = campaign.screens?.[3] || {};
  const contrastBg = mobileConfig?.contrastBackground || resultScreen.contrastBackground;
  
  const defaultWinMessage = "Félicitations ! Vous avez gagné !";
  const defaultLoseMessage = "Dommage ! Tentez votre chance une prochaine fois.";
  const defaultThankYouMessage = "Merci pour votre participation !";

  const winMessage = resultScreen?.winMessage || defaultWinMessage;
  const loseMessage = resultScreen?.loseMessage || defaultLoseMessage;
  const thankYouMessage = resultScreen?.description || defaultThankYouMessage;

  return (
    <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center space-y-4">
      <ContrastBackground
        enabled={contrastBg?.enabled}
        config={contrastBg}
        className="text-center space-y-4 w-full p-6 rounded-lg"
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
            className="inline-flex items-center justify-center px-6 py-2 bg-[#841b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors"
          >
            {resultScreen?.replayButtonText || 'Rejouer'}
          </button>

          {resultScreen?.secondaryCtaLink && (
            <a 
              href={resultScreen.secondaryCtaLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-[#841b60] hover:text-[#6d164f] underline"
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

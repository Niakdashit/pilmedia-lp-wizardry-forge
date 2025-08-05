
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
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
  const navigate = useNavigate();
  const resultScreen = campaign.screens?.[3] || {};
  const contrastBg = mobileConfig?.contrastBackground || resultScreen.contrastBackground;
  
  const defaultWinMessage = "Félicitations ! Vous avez gagné !";
  const defaultLoseMessage = "Dommage ! Tentez votre chance une prochaine fois.";
  const defaultThankYouMessage = "Merci pour votre participation !";

  const winMessage = resultScreen?.winMessage || defaultWinMessage;
  const loseMessage = resultScreen?.loseMessage || defaultLoseMessage;
  const thankYouMessage = resultScreen?.description || defaultThankYouMessage;

  const handleAdvancedEditor = () => {
    try {
      // Transformer les données de campagne vers le format EditorConfig
      const editorConfig = {
        width: 810,
        height: 1200,
        anchor: 'fixed',
        gameType: campaign.type || 'wheel',
        gameMode: 'mode1-sequential',
        displayMode: 'mode1-banner-game',
        storyText: campaign.general?.description || campaign.description || 'Campagne créée',
        publisherLink: campaign.general?.brandSiteUrl || '',
        prizeText: `Participez et tentez de gagner !`,
        customTexts: [],
        centerText: false,
        centerForm: true,
        centerGameZone: true,
        backgroundColor: campaign.design?.backgroundColor || '#ffffff',
        outlineColor: campaign.design?.borderColor || '#ffffff',
        borderStyle: 'classic',
        jackpotBorderStyle: 'classic',
        participateButtonText: campaign.buttonConfig?.text || 'PARTICIPER !',
        participateButtonColor: campaign.design?.primaryColor || '#ff6b35',
        participateButtonTextColor: campaign.design?.accentColor || '#ffffff',
        footerText: '',
        footerColor: '#f8f9fa',
        customCSS: '',
        customJS: '',
        trackingTags: '',
        deviceConfig: {
          mobile: {
            fontSize: 14,
            backgroundImage: campaign.design?.backgroundImage || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          },
          tablet: {
            fontSize: 16,
            backgroundImage: campaign.design?.backgroundImage || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          },
          desktop: {
            fontSize: 18,
            backgroundImage: campaign.design?.backgroundImage || undefined,
            gamePosition: { x: 0, y: 0, scale: 1.7 }
          }
        },
        autoSyncOnDeviceChange: false,
        autoSyncRealTime: false,
        autoSyncBaseDevice: 'desktop',
        gameConfig: campaign.gameConfig || {},
        wheelConfig: campaign.config?.roulette || campaign.config || {},
        brandAnalysis: campaign.brandAnalysis || null,
        centerLogo: campaign.design?.centerLogo || null,
        designColors: campaign.design?.customColors || {}
      };
      
      localStorage.setItem('campaignPreview', JSON.stringify(campaign));
      localStorage.setItem('editorConfig', JSON.stringify(editorConfig));
      
      navigate('/design-editor');
    } catch (error) {
      console.error('Erreur lors du transfert vers l\'éditeur:', error);
    }
  };

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
            onClick={handleAdvancedEditor} 
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Éditeur avancé
          </button>
          
          <button 
            onClick={onReset} 
            className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-medium rounded-lg hover:bg-[#6d164f] transition-colors"
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

import React from 'react';
import Jackpot from '../GameTypes/Jackpot';
import WheelPreview from '../GameTypes/WheelPreview';
import ScratchPreview from '../GameTypes/ScratchPreview';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';
import FunnelStandard from '../funnels/FunnelStandard';
import { GameSize } from '../configurators/GameSizeSelector';
import { createSynchronizedQuizCampaign } from '../../utils/quizConfigSync';
import { useGamePositionCalculator } from './GamePositionCalculator';
import useCenteredStyles from '../../hooks/useCenteredStyles';
interface GameRendererProps {
  campaign: any;
  gameSize: GameSize;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  buttonLabel?: string;
  buttonColor?: string;
  gameBackgroundImage?: string;
  className?: string;
}
const GameRenderer: React.FC<GameRendererProps> = ({
  campaign,
  gameSize,
  previewDevice,
  buttonLabel,
  buttonColor,
  gameBackgroundImage,
  className = ''
}) => {
  // Utiliser le système de synchronisation pour le quiz
  const enhancedCampaign = campaign.type === 'quiz' ? createSynchronizedQuizCampaign(campaign) : campaign;

  // Types de jeux utilisant le funnel unlocked_game
  const unlockedTypes = ['wheel', 'scratch', 'jackpot', 'dice'];
  const gamePosition = enhancedCampaign.gamePosition || 'center';
  const {
    containerStyle: baseContainerStyle,
    wrapperStyle
  } = useCenteredStyles();
  const {
    getPositionStyles
  } = useGamePositionCalculator({
    gameSize,
    gamePosition,
    shouldCropWheel: false
  });

  // Déterminer le funnel à utiliser
  const shouldUseUnlockedFunnel = unlockedTypes.includes(enhancedCampaign.type) || enhancedCampaign.funnel === 'unlocked_game';

  // Style du conteneur principal avec des dimensions plus généreuses
  const containerStyle: React.CSSProperties = {
    ...baseContainerStyle,
    backgroundColor: enhancedCampaign.design?.background || '#f8fafc',
    position: 'relative',
    overflow: 'visible',
    minHeight: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Ajouter l'image de fond si définie
  if (gameBackgroundImage || enhancedCampaign.design?.backgroundImage) {
    const bgImage = gameBackgroundImage || enhancedCampaign.design?.backgroundImage;
    containerStyle.backgroundImage = `url(${bgImage})`;
    containerStyle.backgroundSize = 'cover';
    containerStyle.backgroundPosition = 'center';
    containerStyle.backgroundRepeat = 'no-repeat';
  }

  // Pour les types form et quiz, utiliser le funnel standard
  if (enhancedCampaign.type === 'form' || enhancedCampaign.type === 'quiz') {
    return <div className={className} style={containerStyle}>
        {gameBackgroundImage && <div className="absolute inset-0 bg-black/20" style={{
        zIndex: 1
      }} />}
        <div className="relative z-10 w-full h-full flex items-center justify-center" style={{
        ...wrapperStyle,
        ...getPositionStyles()
      }}>
          <FunnelStandard campaign={enhancedCampaign} key={`standard-${enhancedCampaign.type}-${JSON.stringify(enhancedCampaign.gameConfig)}`} />
        </div>
      </div>;
  }

  // Pour les autres types, utiliser le funnel approprié
  if (shouldUseUnlockedFunnel) {
    return <div className={className} style={containerStyle}>
        {gameBackgroundImage}
        <div className="relative z-10 w-full h-full flex items-center justify-center" style={{
        ...wrapperStyle,
        ...getPositionStyles()
      }}>
          <FunnelUnlockedGame campaign={enhancedCampaign} previewMode={previewDevice === 'desktop' ? 'desktop' : previewDevice} modalContained={false} key={`unlocked-${enhancedCampaign.type}-${JSON.stringify(enhancedCampaign.gameConfig)}`} />
        </div>
      </div>;
  }

  // Fallback vers le rendu direct du jeu
  const renderDirectGame = () => {
    switch (enhancedCampaign.type) {
      case 'jackpot':
        return <Jackpot isPreview={true} instantWinConfig={{
          mode: 'instant_winner' as const,
          winProbability: enhancedCampaign.gameConfig?.jackpot?.instantWin?.winProbability || 0.05,
          maxWinners: enhancedCampaign.gameConfig?.jackpot?.instantWin?.maxWinners,
          winnersCount: 0
        }} buttonLabel={buttonLabel || enhancedCampaign.gameConfig?.jackpot?.buttonLabel || 'Jouer'} buttonColor={buttonColor || enhancedCampaign.buttonConfig?.color || '#841b60'} backgroundImage={gameBackgroundImage} containerBackgroundColor={enhancedCampaign.gameConfig?.jackpot?.containerBackgroundColor || '#1f2937'} backgroundColor={enhancedCampaign.gameConfig?.jackpot?.backgroundColor || '#c4b5fd30'} borderColor={enhancedCampaign.gameConfig?.jackpot?.borderColor || '#8b5cf6'} borderWidth={enhancedCampaign.gameConfig?.jackpot?.borderWidth || 3} slotBorderColor={enhancedCampaign.gameConfig?.jackpot?.slotBorderColor || '#a78bfa'} slotBorderWidth={enhancedCampaign.gameConfig?.jackpot?.slotBorderWidth || 2} slotBackgroundColor={enhancedCampaign.gameConfig?.jackpot?.slotBackgroundColor || '#ffffff'} />;
      case 'wheel':
        return <WheelPreview campaign={enhancedCampaign} config={{
          mode: 'instant_winner' as const,
          winProbability: enhancedCampaign.gameConfig?.wheel?.winProbability || 0.1,
          maxWinners: enhancedCampaign.gameConfig?.wheel?.maxWinners,
          winnersCount: 0
        }} onFinish={() => {}} gameSize={gameSize} gamePosition={enhancedCampaign.gamePosition || 'center'} previewDevice={previewDevice} disableForm={true} />;
      case 'scratch':
        return <ScratchPreview config={enhancedCampaign.gameConfig?.scratch || {}} buttonLabel={buttonLabel || enhancedCampaign.gameConfig?.scratch?.buttonLabel || 'Gratter'} buttonColor={buttonColor || enhancedCampaign.buttonConfig?.color || '#841b60'} gameSize={gameSize} autoStart />;
      default:
        return <div className="text-center text-gray-500 flex items-center justify-center h-full">
            <p className="text-sm">Type de jeu non pris en charge: {enhancedCampaign.type}</p>
          </div>;
    }
  };
  return <div className={className} style={containerStyle}>
      {gameBackgroundImage && <div className="absolute inset-0 bg-black/20" style={{
      zIndex: 1
    }} />}
      <div className="relative z-10 flex items-center justify-center w-full h-full" style={{
      ...wrapperStyle,
      ...getPositionStyles()
    }}>
        {renderDirectGame()}
      </div>
    </div>;
};
export default GameRenderer;
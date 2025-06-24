
import React from 'react';
import { GameSize, GAME_SIZES } from '../configurators/GameSizeSelector';
import { getCampaignBackgroundImage } from '../../utils/background';
import WheelPreview from '../GameTypes/WheelPreview';
import { Jackpot } from '../GameTypes';
import ScratchPreview from '../GameTypes/ScratchPreview';
import DicePreview from '../GameTypes/DicePreview';
import QuizPreview from '../GameTypes/QuizPreview';
import useCenteredStyles from '../../hooks/useCenteredStyles';

interface GameCanvasPreviewProps {
  campaign: any;
  gameSize: GameSize;
  gameBackgroundImage?: string;
  /**
   * Display a dark overlay between the background image and the game.
   * Defaults to false to show the raw background.
   */
  showBackgroundOverlay?: boolean;
  className?: string;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  gameSize,
  gameBackgroundImage,
  className = '',
  previewDevice = 'desktop',
  showBackgroundOverlay = false
}) => {
  // Résoudre l'image de fond à afficher (priorité à la prop, fallback sur config)
  const resolvedBackground =
    gameBackgroundImage || getCampaignBackgroundImage(campaign, previewDevice);

  const { containerStyle: baseContainerStyle, wrapperStyle } = useCenteredStyles();

  const getContainerClasses = () => {
    const baseClasses = "bg-white border-2 border-gray-200 overflow-auto";
    
    if (previewDevice === 'mobile') {
      return `${baseClasses} rounded-3xl shadow-2xl`;
    } else if (previewDevice === 'tablet') {
      return `${baseClasses} rounded-2xl shadow-xl`;
    } else {
      return `${baseClasses} rounded-xl shadow-lg`;
    }
  };

  const getContainerStyle = () => {
    const dimensions = GAME_SIZES[gameSize];
    // Augmenter significativement la hauteur minimale pour éviter les coupures
    const baseMinHeight = Math.max(dimensions.height + 200, 600);

    const baseStyle: React.CSSProperties = {
      ...baseContainerStyle,
      minHeight: `${baseMinHeight}px`,
      maxHeight: '90vh', // Limiter à 90% de la hauteur viewport
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: '100%'
    };

    // Ajouter l'image de fond si définie
    if (resolvedBackground) {
      baseStyle.backgroundImage = `url(${resolvedBackground})`;
      baseStyle.backgroundSize = 'cover';
      baseStyle.backgroundPosition = 'center';
      baseStyle.backgroundRepeat = 'no-repeat';
    }

    if (previewDevice === 'mobile') {
      return {
        ...baseStyle,
        padding: '20px',
        minHeight: `${Math.max(baseMinHeight, 700)}px`
      };
    } else if (previewDevice === 'tablet') {
      return {
        ...baseStyle,
        padding: '24px',
        minHeight: `${Math.max(baseMinHeight, 650)}px`
      };
    }

    return {
      ...baseStyle,
      padding: '32px',
      minHeight: `${baseMinHeight}px`
    };
  };

  const renderPreviewGame = () => {
    const gamePosition = campaign.gamePosition || 'center';

    switch (campaign.type) {
      case 'wheel':
        return (
          <WheelPreview
            campaign={campaign}
            config={{
              mode: 'instant_winner' as const,
              winProbability: campaign.gameConfig?.wheel?.winProbability || 0.1,
              maxWinners: campaign.gameConfig?.wheel?.maxWinners,
              winnersCount: 0
            }}
            onFinish={() => console.log('Preview wheel finished')}
            onStart={() => console.log('Preview wheel started')}
            gameSize={gameSize}
            gamePosition={gamePosition}
            previewDevice={previewDevice}
            disabled={false}
            disableForm={true}
          />
        );
      
      case 'scratch':
        return (
          <ScratchPreview 
            config={campaign.gameConfig?.scratch || {}}
            buttonLabel={campaign.gameConfig?.[campaign.type]?.buttonLabel || campaign.buttonConfig?.text}
            buttonColor={campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60'}
            gameSize={gameSize}
            disabled={false}
            onFinish={() => console.log('Preview scratch finished')}
            onStart={() => console.log('Preview scratch started')}
            isModal={false}
            autoStart={false}
          />
        );
      
      case 'jackpot':
        return (
          <Jackpot
            isPreview={true}
            instantWinConfig={campaign.gameConfig?.jackpot?.instantWin}
            buttonLabel={campaign.gameConfig?.[campaign.type]?.buttonLabel || campaign.buttonConfig?.text}
            buttonColor={campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60'}
            backgroundImage={resolvedBackground}
            containerBackgroundColor={campaign.gameConfig?.jackpot?.containerBackgroundColor}
            backgroundColor={campaign.gameConfig?.jackpot?.backgroundColor}
            borderColor={campaign.gameConfig?.jackpot?.borderColor}
            borderWidth={campaign.gameConfig?.jackpot?.borderWidth}
            slotBorderColor={campaign.gameConfig?.jackpot?.slotBorderColor}
            slotBorderWidth={campaign.gameConfig?.jackpot?.slotBorderWidth}
            slotBackgroundColor={campaign.gameConfig?.jackpot?.slotBackgroundColor}
            disabled={false}
            onFinish={() => console.log('Preview jackpot finished')}
            onStart={() => console.log('Preview jackpot started')}
          />
        );
      
      case 'quiz':
        return (
          <div style={{ 
            width: '100%', 
            maxWidth: '800px', 
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <QuizPreview
              config={campaign.gameConfig?.quiz || {}}
              design={campaign.design}
            />
          </div>
        );
      
      case 'dice':
        return (
          <DicePreview
            config={campaign.gameConfig?.dice || {}}
          />
        );
      
      default:
        return <div className="text-center text-gray-500">Jeu non supporté: {campaign.type}</div>;
    }
  };

  return (
    <div 
      className={`${getContainerClasses()} ${className}`}
      style={getContainerStyle()}
    >
      {resolvedBackground && showBackgroundOverlay && (
        <div className="absolute inset-0 bg-black/20" style={{ zIndex: 1 }} />
      )}
      
      <div className="relative z-10 w-full h-full flex items-center justify-center" style={wrapperStyle}>
        {renderPreviewGame()}
      </div>
    </div>
  );
};

export default GameCanvasPreview;

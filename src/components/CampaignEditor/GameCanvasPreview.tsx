
import React from 'react';
import { GameSize, GAME_SIZES } from '../configurators/GameSizeSelector';
import { getCampaignBackgroundImage } from '../../utils/background';
import WheelPreview from '../GameTypes/WheelPreview';
import { Jackpot } from '../GameTypes';
import ScratchPreview from '../GameTypes/ScratchPreview';
import DicePreview from '../GameTypes/DicePreview';
import QuizPreview from '../GameTypes/QuizPreview';

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

  const getContainerClasses = () => {
    const baseClasses = "bg-white border-2 border-gray-200";
    
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
    
    // Dimensions fixes non-responsive pour éviter le crop
    const fixedWidth = Math.max(dimensions.width, 800);
    const fixedHeight = Math.max(dimensions.height + 200, 700);

    const baseStyle: React.CSSProperties = {
      width: `${fixedWidth}px`,
      height: `${fixedHeight}px`,
      minWidth: `${fixedWidth}px`,
      minHeight: `${fixedHeight}px`,
      maxWidth: 'none', // Pas de limite max pour éviter le responsive
      maxHeight: 'none', // Pas de limite max pour éviter le responsive
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'visible' // Permettre le débordement naturel
    };

    // Ajouter l'image de fond si définie
    if (resolvedBackground) {
      baseStyle.backgroundImage = `url(${resolvedBackground})`;
      baseStyle.backgroundSize = 'cover';
      baseStyle.backgroundPosition = 'center';
      baseStyle.backgroundRepeat = 'no-repeat';
    }

    // Padding selon le device mais sans affecter les dimensions
    if (previewDevice === 'mobile') {
      baseStyle.padding = '20px';
    } else if (previewDevice === 'tablet') {
      baseStyle.padding = '24px';
    } else {
      baseStyle.padding = '32px';
    }

    return baseStyle;
  };

  // Container wrapper avec scroll pour gérer le débordement
  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'auto', // Permettre le scroll
    display: 'flex',
    alignItems: 'flex-start', // Aligner en haut pour éviter le centrage qui peut couper
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box'
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
            disableForm={false}
            showShadow={true}
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
    <div style={wrapperStyle} className={className}>
      <div 
        className={getContainerClasses()}
        style={getContainerStyle()}
      >
        {resolvedBackground && showBackgroundOverlay && (
          <div className="absolute inset-0 bg-black/20" style={{ zIndex: 1 }} />
        )}
        
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {renderPreviewGame()}
        </div>
      </div>
    </div>
  );
};

export default GameCanvasPreview;

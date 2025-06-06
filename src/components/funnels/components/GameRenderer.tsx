import React from 'react';
import ContrastBackground from '../../common/ContrastBackground';
import ValidationMessage from '../../common/ValidationMessage';
import WheelPreview from '../../GameTypes/WheelPreview';
import { Jackpot } from '../../GameTypes';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import DicePreview from '../../GameTypes/DicePreview';
import { GAME_SIZES, GameSize } from '../../configurators/GameSizeSelector';

interface GameRendererProps {
  campaign: any;
  formValidated: boolean;
  showValidationMessage: boolean;
  previewMode: 'mobile' | 'tablet' | 'desktop';
  mobileConfig?: any;
  onGameFinish: (result: 'win' | 'lose') => void;
  onGameStart: () => void;
  onGameButtonClick: () => void;
}

const GameRenderer: React.FC<GameRendererProps> = ({
  campaign,
  formValidated,
  showValidationMessage,
  previewMode,
  mobileConfig,
  onGameFinish,
  onGameStart,
  onGameButtonClick
}) => {
  const gameBackgroundImage = campaign.gameConfig?.[campaign.type]?.backgroundImage;
  const buttonLabel = campaign.gameConfig?.[campaign.type]?.buttonLabel || campaign.buttonConfig?.text;
  const buttonColor = campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60';
  const contrastBg = mobileConfig?.contrastBackground || campaign.screens?.[2]?.contrastBackground;

  const gameSize: GameSize = (campaign.gameSize && Object.keys(GAME_SIZES).includes(campaign.gameSize)) 
    ? campaign.gameSize as GameSize 
    : 'medium';
  const gamePosition = campaign.gamePosition || 'center';

  const getGameContainerStyle = (): React.CSSProperties => {
    const gameDimensions = GAME_SIZES[gameSize];
    let scaleFactor = 1;
    
    if (previewMode === 'mobile') {
      scaleFactor = 0.8;
    } else if (previewMode === 'tablet') {
      scaleFactor = 0.9;
    }

    return {
      width: `${gameDimensions.width * scaleFactor}px`,
      height: `${gameDimensions.height * scaleFactor}px`,
      maxWidth: `${gameDimensions.width * scaleFactor}px`,
      maxHeight: `${gameDimensions.height * scaleFactor}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
      margin: '0 auto',
      position: 'relative'
    };
  };

  const handleGameComplete = (result: 'win' | 'lose') => {
    onGameFinish(result);
  };

  const handleGameStartInternal = () => {
    onGameStart();
  };

  const renderGameComponent = () => {
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
            onFinish={handleGameComplete}
            onStart={handleGameStartInternal}
            gameSize={gameSize}
            gamePosition={gamePosition}
            disabled={!formValidated}
          />
        );
      case 'scratch':
        return (
          <ScratchPreview 
            config={campaign.gameConfig?.scratch || {}}
            buttonLabel={buttonLabel}
            buttonColor={buttonColor}
            gameSize={gameSize}
            isPreview={true}
            instantWinConfig={campaign.gameConfig?.scratch?.instantWin || {
              mode: 'instant_winner' as const,
              winProbability: 0.1,
              maxWinners: 10,
              winnersCount: 0
            }}
            disabled={!formValidated}
            onFinish={handleGameComplete}
            onStart={handleGameStartInternal}
          />
        );
      case 'jackpot':
        return (
          <Jackpot
            isPreview={true}
            instantWinConfig={campaign.gameConfig?.jackpot?.instantWin}
            buttonLabel={buttonLabel}
            buttonColor={buttonColor}
            backgroundImage={gameBackgroundImage}
            containerBackgroundColor={campaign.gameConfig?.jackpot?.containerBackgroundColor}
            backgroundColor={campaign.gameConfig?.jackpot?.backgroundColor}
            borderColor={campaign.gameConfig?.jackpot?.borderColor}
            borderWidth={campaign.gameConfig?.jackpot?.borderWidth}
            slotBorderColor={campaign.gameConfig?.jackpot?.slotBorderColor}
            slotBorderWidth={campaign.gameConfig?.jackpot?.slotBorderWidth}
            slotBackgroundColor={campaign.gameConfig?.jackpot?.slotBackgroundColor}
            onFinish={handleGameComplete}
            onStart={handleGameStartInternal}
          />
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
    <div style={getGameContainerStyle()} className="rounded-lg overflow-visible relative">
      <div className="relative z-20 w-full h-full flex items-center justify-center">
        <ContrastBackground
          enabled={contrastBg?.enabled && contrastBg?.applyToGame}
          config={contrastBg}
          className="h-full w-full flex items-center justify-center"
        >
          {renderGameComponent()}
        </ContrastBackground>
      </div>
      
      {!formValidated && (
        <div 
          onClick={() => {
            onGameButtonClick();
          }}
          className="absolute inset-0 flex items-center justify-center z-30 rounded-lg cursor-pointer bg-black/0" 
        />
      )}

      <ValidationMessage
        show={showValidationMessage}
        message="Formulaire validé ! Vous pouvez maintenant jouer."
        type="success"
      />
    </div>
  );
};

export default GameRenderer;


import React from 'react';
import ContrastBackground from '../../common/ContrastBackground';
import ValidationMessage from '../../common/ValidationMessage';
import WheelPreview from '../../GameTypes/WheelPreview';
import { Jackpot } from '../../GameTypes';
import QuizPreview from '../../GameTypes/QuizPreview';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import DicePreview from '../../GameTypes/DicePreview';
import { GAME_SIZES, GameSize } from '../../configurators/GameSizeSelector';
import { useGamePositionCalculator } from '../../CampaignEditor/GamePositionCalculator';
import useCenteredStyles from '../../../hooks/useCenteredStyles';
import { getCampaignBackgroundImage } from '../../../utils/background';

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
  const gameBackgroundImage = getCampaignBackgroundImage(campaign, previewMode);
  const buttonLabel = campaign.gameConfig?.[campaign.type]?.buttonLabel || campaign.buttonConfig?.text;
  const buttonColor = campaign.buttonConfig?.color || campaign.gameConfig?.[campaign.type]?.buttonColor || '#841b60';
  const contrastBg = mobileConfig?.contrastBackground || campaign.screens?.[2]?.contrastBackground;

  const gameSize: GameSize = (campaign.gameSize && Object.keys(GAME_SIZES).includes(campaign.gameSize)) 
    ? campaign.gameSize as GameSize 
    : 'medium';
  const gamePosition = campaign.gamePosition || 'center';

  // Détecter si on est dans une modal (pour ajuster l'affichage)
  const isModal = previewMode !== 'desktop' || window.location.pathname.includes('preview');

  const { containerStyle, wrapperStyle } = useCenteredStyles();
  const { getPositionStyles } = useGamePositionCalculator({
    gameSize,
    gamePosition,
    shouldCropWheel: false
  });

  const baseMinHeight = Math.max(GAME_SIZES[gameSize].height + 100, 400);

  const handleGameComplete = (result: 'win' | 'lose') => {
    console.log('Game completed with result:', result);
    onGameFinish(result);
  };

  const handleGameStartInternal = () => {
    console.log('Game started');
    onGameStart();
  };

  const renderGameComponent = () => {
    console.log('Rendering game component for type:', campaign.type);
    console.log('Form validated:', formValidated);
    
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
            previewDevice={previewMode}
            disabled={!formValidated}
            disableForm={false}
          />
        );
      
      case 'scratch':
        return (
          <ScratchPreview 
            config={campaign.gameConfig?.scratch || {}}
            buttonLabel={buttonLabel}
            buttonColor={buttonColor}
            gameSize={gameSize}
            disabled={!formValidated}
            onFinish={handleGameComplete}
            onStart={handleGameStartInternal}
            isModal={isModal}
            autoStart={false}
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
            disabled={!formValidated}
            onFinish={handleGameComplete}
            onStart={handleGameStartInternal}
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
        console.warn('Unsupported game type:', campaign.type);
        return (
          <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">Jeu non supporté</h3>
            <p className="text-sm">Le type "{campaign.type}" n'est pas encore implémenté dans ce funnel.</p>
          </div>
        );
    }
  };

  return (
    <div style={{
      ...containerStyle,
      minHeight: `${baseMinHeight}px`,
      padding: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }} className="rounded-lg overflow-visible relative">
      <div style={{ 
        ...wrapperStyle, 
        ...getPositionStyles(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}>
        <ContrastBackground
          enabled={contrastBg?.enabled && contrastBg?.applyToGame}
          config={contrastBg}
          className="flex items-center justify-center w-full h-full"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}>
            {renderGameComponent()}
          </div>
        </ContrastBackground>
      </div>
      
      {!formValidated && ['wheel', 'scratch', 'jackpot'].includes(campaign.type) && (
        <div 
          onClick={() => {
            console.log('Game overlay clicked - triggering form');
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

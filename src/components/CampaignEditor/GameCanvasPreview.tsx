import React from 'react';
import { GameSize } from '../configurators/GameSizeSelector';
import { getCampaignBackgroundImage } from '../../utils/background';
import WheelPreview from '../GameTypes/WheelPreview';
import { Jackpot } from '../GameTypes';
import ScratchPreview from '../GameTypes/ScratchPreview';
import DicePreview from '../GameTypes/DicePreview';
import QuizPreview from '../GameTypes/QuizPreview';
import CustomElementsRenderer from '../ModernEditor/components/CustomElementsRenderer';

interface GameCanvasPreviewProps {
  campaign: any;
  gameSize: GameSize;
  gameBackgroundImage?: string;
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
  const resolvedBackground =
    gameBackgroundImage || getCampaignBackgroundImage(campaign, previewDevice);

  // Size mapping for text elements
  const sizeMap: Record<string, string> = {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '36px',
    '7xl': '48px',
    '8xl': '60px',
    '9xl': '72px'
  };

  // Extract custom elements
  const customTexts = campaign.design?.customTexts || [];
  const customImages = campaign.design?.customImages || [];

  const getContainerStyle = (): React.CSSProperties => {
    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: campaign.design?.background || '#ebf4f7',
      backgroundImage: resolvedBackground ? `url(${resolvedBackground})` : undefined,
      backgroundSize: 'contain', // Changed from 'cover' to 'contain'
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: previewDevice === 'mobile' ? '24px' : previewDevice === 'tablet' ? '16px' : '12px',
      border: '2px solid #e5e7eb'
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
            onFinish={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('Preview wheel finished');
              }
            }}
            onStart={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('Preview wheel started');
              }
            }}
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
            onFinish={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('Preview scratch finished');
              }
            }}
            onStart={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('Preview scratch started');
              }
            }}
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
            borderStyle="classic"
            slotBorderColor={campaign.gameConfig?.jackpot?.slotBorderColor}
            slotBorderWidth={campaign.gameConfig?.jackpot?.slotBorderWidth}
            slotBackgroundColor={campaign.gameConfig?.jackpot?.slotBackgroundColor}
            disabled={false}
            onFinish={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('Preview jackpot finished');
              }
            }}
            onStart={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('Preview jackpot started');
              }
            }}
          />
        );
      
      case 'quiz':
        return (
          <div style={{ 
            width: '100%', 
            maxWidth: '600px', 
            height: 'auto',
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
    <div className={className} style={getContainerStyle()}>
      {resolvedBackground && showBackgroundOverlay && (
        <div className="absolute inset-0 bg-black/20" style={{ zIndex: 1 }} />
      )}
      
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden'
      }}>
        {renderPreviewGame()}
      </div>

      {/* Render custom elements on top */}
      <CustomElementsRenderer
        customTexts={customTexts}
        customImages={customImages}
        previewDevice={previewDevice}
        sizeMap={sizeMap}
      />
    </div>
  );
};

export default GameCanvasPreview;

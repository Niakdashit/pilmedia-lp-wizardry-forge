
import React, { useEffect, useState } from 'react';
import ContrastBackground from '../../common/ContrastBackground';
import ValidationMessage from '../../common/ValidationMessage';
import QuizPreview from '../../GameTypes/QuizPreview';
import DicePreview from '../../GameTypes/DicePreview';
import DoubleMechanicWheel from '../../GameTypes/DoubleMechanicWheel';
import DoubleMechanicJackpot from '../../GameTypes/DoubleMechanicJackpot';
import DoubleMechanicScratch from '../../GameTypes/DoubleMechanicScratch';
import { GAME_SIZES, GameSize } from '../../configurators/GameSizeSelector';
// Removed legacy CampaignEditor dependency: inline position calculator
import useCenteredStyles from '../../../hooks/useCenteredStyles';
import { useCampaignSettings } from '../../../hooks/useCampaignSettings';

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
  const { getSettings } = useCampaignSettings();
  const [campaignSettings, setCampaignSettings] = useState<any>(null);
  
  // Charger les settings de campagne incluant dotation
  useEffect(() => {
    console.log('🎯 [GameRenderer] Campaign ID:', campaign?.id);
    if (campaign?.id) {
      getSettings(campaign.id).then(settings => {
        if (settings) {
          setCampaignSettings(settings);
          console.log('🎯 [GameRenderer] Campaign settings loaded:', settings);
          console.log('🎯 [GameRenderer] Dotation data:', settings.dotation);
        } else {
          console.warn('⚠️ [GameRenderer] No settings found for campaign:', campaign.id);
        }
      }).catch(error => {
        console.error('❌ [GameRenderer] Error loading settings:', error);
      });
    } else {
      console.warn('⚠️ [GameRenderer] No campaign ID provided');
    }
  }, [campaign?.id, getSettings]);
  
  const contrastBg = mobileConfig?.contrastBackground || campaign.screens?.[2]?.contrastBackground;

  const gameSize: GameSize = (campaign.gameSize && Object.keys(GAME_SIZES).includes(campaign.gameSize)) 
    ? campaign.gameSize as GameSize 
    : 'medium';
  const gamePosition = campaign.gamePosition || 'center';

  const { containerStyle, wrapperStyle } = useCenteredStyles();
  const getPositionStyles = () => {
    const dims = GAME_SIZES[gameSize];
    const style: React.CSSProperties = {
      width: `${dims.width}px`,
      height: `${dims.height}px`
    };
    switch (gamePosition) {
      case 'top':
        return { ...style, marginTop: 0, marginBottom: 'auto' } as React.CSSProperties;
      case 'bottom':
        return { ...style, marginTop: 'auto', marginBottom: 0 } as React.CSSProperties;
      case 'left':
        return { ...style, marginLeft: 0, marginRight: 'auto' } as React.CSSProperties;
      case 'right':
        return { ...style, marginLeft: 'auto', marginRight: 0 } as React.CSSProperties;
      default:
        return { ...style, margin: '0 auto' } as React.CSSProperties;
    }
  };

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
    console.log('Campaign settings:', campaignSettings);
    
    // Créer une campagne enrichie avec les settings
    const enrichedCampaign = {
      ...campaign,
      settings: campaignSettings
    };
    
    switch (campaign.type) {
      case 'wheel':
        return (
          <DoubleMechanicWheel
            config={{}}
            campaign={enrichedCampaign}
            isPreview={false}
            onComplete={(prize) => {
              console.log('Prize won:', prize);
            }}
            onFinish={handleGameComplete}
            onStart={handleGameStartInternal}
            disabled={!formValidated}
            gameSize={gameSize}
          />
        );
      
      case 'scratch':
        return (
          <DoubleMechanicScratch
            config={campaign.gameConfig?.scratch || {}}
            campaign={enrichedCampaign}
            isPreview={false}
            onFinish={handleGameComplete}
          />
        );
      
      case 'jackpot':
        return (
          <DoubleMechanicJackpot
            campaign={enrichedCampaign}
            isPreview={false}
            onFinish={handleGameComplete}
            disabled={!formValidated}
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
      overflow: 'visible'
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

      <ValidationMessage
        show={showValidationMessage}
        message="Formulaire validé ! Vous pouvez maintenant jouer."
        type="success"
      />
    </div>
  );
};

export default GameRenderer;

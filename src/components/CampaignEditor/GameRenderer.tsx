
import React from 'react';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';
import FunnelStandard from '../funnels/FunnelStandard';
import { GameSize } from '../configurators/GameSizeSelector';
import { createSynchronizedQuizCampaign } from '../../utils/quizConfigSync';
import { useGamePositionCalculator } from './GamePositionCalculator';
import useCenteredStyles from '../../hooks/useCenteredStyles';
import { shouldUseUnlockedFunnel, shouldUseStandardFunnel } from '../../utils/funnelMatcher';
import { SmartWheel } from '../SmartWheel';
import EditableGameText from './EditableGameText';

interface GameRendererProps {
  campaign: any;
  gameSize: GameSize;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  gameBackgroundImage?: string;
  /**
   * Display a dark overlay between the background image and the game content.
   * Disabled by default to keep the background fully visible.
   */
  showBackgroundOverlay?: boolean;
  className?: string;
  onTextUpdate?: (textId: string, newText: string) => void;
}

const GameRenderer: React.FC<GameRendererProps> = ({
  campaign,
  gameSize,
  previewDevice,
  gameBackgroundImage,
  showBackgroundOverlay = false,
  className = '',
  onTextUpdate
}) => {
  // Utiliser le système de synchronisation pour le quiz
  const enhancedCampaign = campaign.type === 'quiz'
    ? createSynchronizedQuizCampaign(campaign)
    : campaign;

  const gamePosition = enhancedCampaign.gamePosition || 'center';
  const { containerStyle: baseContainerStyle, wrapperStyle } = useCenteredStyles();
  const { getPositionStyles } = useGamePositionCalculator({
    gameSize,
    gamePosition,
    shouldCropWheel: false
  });
  
  // Déterminer le funnel à utiliser basé uniquement sur le type de jeu
  const useUnlockedFunnel = shouldUseUnlockedFunnel(enhancedCampaign.type);
  const useStandardFunnel = shouldUseStandardFunnel(enhancedCampaign.type);

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
    containerStyle.backgroundSize = '100% auto'; // Force image to take full width
    containerStyle.backgroundPosition = 'center top';
    containerStyle.backgroundRepeat = 'no-repeat';
  }

  // Si c'est une roue, utiliser directement le SmartWheel
  if (enhancedCampaign.type === 'wheel') {
    const segments = enhancedCampaign.gameConfig?.wheel?.segments || 
                    enhancedCampaign.config?.roulette?.segments || [];

    const brandColors = {
      primary: enhancedCampaign.design?.customColors?.primary || '#841b60',
      secondary: enhancedCampaign.design?.customColors?.secondary || '#4ecdc4',
      accent: enhancedCampaign.design?.customColors?.accent || '#45b7d1'
    };

    const wheelSize = gameSize === 'small' ? 200 : 
                     gameSize === 'medium' ? 300 : 
                     gameSize === 'large' ? 400 : 500;

    // Récupérer le style de bordure depuis la campagne
    const borderStyle = enhancedCampaign.design?.wheelBorderStyle || 'classic';

  return (
    <div className={className} style={containerStyle}>
      {gameBackgroundImage && showBackgroundOverlay && (
        <div className="absolute inset-0 bg-black/20" style={{ zIndex: 1 }} />
      )}
      
      {/* Afficher les textes éditables personnalisés */}
      {enhancedCampaign.gameConfig?.customTexts?.map((customText: any, index: number) => (
        <EditableGameText
          key={customText.id || `text-${index}`}
          id={customText.id}
          text={customText.text}
          onUpdate={(newText) => {
            if (onTextUpdate && customText.id) {
              onTextUpdate(customText.id, newText);
            }
          }}
          style={{
            position: 'absolute',
            left: `${customText.position?.x || 50}%`,
            top: `${customText.position?.y || 100}px`,
            transform: 'translateX(-50%)',
            fontSize: customText.style?.fontSize || '18px',
            fontWeight: customText.style?.fontWeight || 'normal',
            color: customText.style?.color || '#ffffff',
            textAlign: customText.style?.textAlign || 'center',
            textShadow: customText.style?.textShadow || '2px 2px 4px rgba(0,0,0,0.8)',
            zIndex: 20,
            maxWidth: '80%',
            wordWrap: 'break-word'
          }}
          multiline={customText.type === 'description'}
        />
      ))}
      
      <div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{ ...wrapperStyle, ...getPositionStyles() }}
      >
        <SmartWheel
          segments={segments}
          theme="modern"
          size={wheelSize}
          brandColors={brandColors}
          borderStyle={borderStyle}
          onResult={(segment) => {
            console.log('Segment gagné dans l\'éditeur:', segment);
          }}
          customButton={{
            text: enhancedCampaign.gameConfig?.wheel?.buttonLabel || 'Faire tourner',
            color: brandColors.primary,
            textColor: '#ffffff'
          }}
        />
      </div>
    </div>
  );
  }

  // Pour les types utilisant le funnel standard
  if (useStandardFunnel) {
    return (
      <div className={className} style={containerStyle}>
        {gameBackgroundImage && showBackgroundOverlay && (
          <div className="absolute inset-0 bg-black/20" style={{ zIndex: 1 }} />
        )}
        <div
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={{ ...wrapperStyle, ...getPositionStyles() }}
        >
          <FunnelStandard
            campaign={enhancedCampaign}
            key={`standard-${enhancedCampaign.type}-${JSON.stringify(
              enhancedCampaign.gameConfig
            )}`}
          />
        </div>
      </div>
    );
  }

  // Pour les types utilisant le funnel unlocked
  if (useUnlockedFunnel) {
    return (
      <div className={className} style={containerStyle}>
        {gameBackgroundImage && showBackgroundOverlay && (
          <div className="absolute inset-0 bg-black/20" style={{ zIndex: 1 }} />
        )}
        <div
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={{ ...wrapperStyle, ...getPositionStyles() }}
        >
          <FunnelUnlockedGame
            campaign={enhancedCampaign}
            previewMode={previewDevice === 'desktop' ? 'desktop' : previewDevice}
            key={`unlocked-${enhancedCampaign.type}-${JSON.stringify(enhancedCampaign.gameConfig)}`}
          />
        </div>
      </div>
    );
  }

  // Fallback pour types non reconnus - afficher un message d'erreur
  return (
    <div className={className} style={containerStyle}>
      <div
        className="relative z-10 flex items-center justify-center w-full h-full"
        style={{ ...wrapperStyle, ...getPositionStyles() }}
      >
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="font-semibold mb-2">Type de jeu non supporté</h3>
          <p className="text-sm">Le type "{enhancedCampaign.type}" n'est pas configuré pour utiliser un funnel.</p>
          <p className="text-xs mt-2 text-gray-600">
            Types supportés: wheel, scratch, jackpot, dice (unlocked) | form, quiz, memory, puzzle (standard)
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameRenderer;

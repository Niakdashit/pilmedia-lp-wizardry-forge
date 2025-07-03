import React, { useMemo, useCallback, memo } from 'react';
import { AlertCircle } from 'lucide-react';
import WheelPreview from '../../GameTypes/WheelPreview';
import QuizPreview from '../../GameTypes/QuizPreview';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import Jackpot from '../../GameTypes/Jackpot';
import DicePreview from '../../GameTypes/DicePreview';
import MemoryPreview from '../../GameTypes/MemoryPreview';
import PuzzlePreview from '../../GameTypes/PuzzlePreview';
import FormPreview from '../../GameTypes/FormPreview';

interface GameCanvasPreviewProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  disableForm?: boolean;
  onGameFinish?: (result: any) => void;
}

const GameCanvasPreview: React.FC<GameCanvasPreviewProps> = ({
  campaign,
  previewDevice,
  disableForm = true,
  onGameFinish
}) => {
  // Style responsif basé sur le device
  const containerStyles = useMemo(() => {
    const backgroundImage = campaign?.design?.backgroundImage || campaign?.design?.background;
    const gamePosition = campaign?.gamePosition || 'center';
    const offsetX = campaign?.design?.gameOffsetX || 0;
    const offsetY = campaign?.design?.gameOffsetY || 0;
    
    // Position mapping pour le jeu
    const positionStyles = {
      'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
      'top-center': { alignItems: 'flex-start', justifyContent: 'center' },
      'top-right': { alignItems: 'flex-start', justifyContent: 'flex-end' },
      'center-left': { alignItems: 'center', justifyContent: 'flex-start' },
      'center': { alignItems: 'center', justifyContent: 'center' },
      'center-right': { alignItems: 'center', justifyContent: 'flex-end' },
      'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
      'bottom-center': { alignItems: 'flex-end', justifyContent: 'center' },
      'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' }
    };

    return {
      width: '100%',
      height: '100%',
      display: 'flex',
      ...positionStyles[gamePosition as keyof typeof positionStyles],
      position: 'relative' as const,
      overflow: 'hidden',
      backgroundColor: campaign?.design?.backgroundColor || '#f3f4f6',
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: previewDevice === 'mobile' ? '24px' : previewDevice === 'tablet' ? '16px' : '12px',
      transform: offsetX || offsetY ? `translate(${offsetX}px, ${offsetY}px)` : undefined
    };
  }, [campaign, previewDevice]);

  // Configuration unifiée du jeu
  const gameConfig = useMemo(() => {
    if (!campaign) {
      return {
        mode: "instant_winner" as const,
        winProbability: 0.1,
        maxWinners: 10,
        winnersCount: 0
      };
    }
    
    const config = {
      mode: "instant_winner" as const,
      winProbability: campaign.gameConfig?.winProbability || 0.1,
      maxWinners: campaign.gameConfig?.maxWinners || 10,
      winnersCount: campaign.gameConfig?.winnersCount || 0
    };
    
    return config;
  }, [campaign?.gameConfig]);

  // Callback optimisé pour la fin de jeu
  const handleGameFinish = useCallback((result: any) => {
    console.log('GameCanvasPreview - Jeu terminé avec résultat:', result);
    onGameFinish?.(result);
  }, [onGameFinish]);

  // Rendu conditionnel du composant de jeu
  const renderGameComponent = () => {
    if (!campaign || !campaign.type) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-gray-500 text-sm">Configuration de campagne manquante</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      campaign,
      config: gameConfig,
      disableForm,
      onFinish: handleGameFinish,
      previewDevice,
      gameSize: campaign.gameSize || 'medium',
      gamePosition: campaign.gamePosition || 'center',
      borderStyle: campaign.design?.wheelBorderStyle || 'classic'
    };

    try {
      switch (campaign.type) {
        case 'wheel':
          return (
            <WheelPreview
              {...commonProps}
              key={`wheel-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        case 'quiz':
          return (
            <QuizPreview
              {...commonProps}
              key={`quiz-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        case 'scratch':
          return (
            <ScratchPreview
              {...commonProps}
              key={`scratch-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        case 'jackpot':
          return (
            <Jackpot
              {...commonProps}
              key={`jackpot-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        case 'dice':
          return (
            <DicePreview
              {...commonProps}
              key={`dice-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        case 'memory':
          return (
            <MemoryPreview
              {...commonProps}
              key={`memory-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        case 'puzzle':
          return (
            <PuzzlePreview
              {...commonProps}
              key={`puzzle-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        case 'form':
          return (
            <FormPreview
              {...commonProps}
              key={`form-${campaign._lastUpdate || Date.now()}`}
            />
          );
          
        default:
          return (
            <div className="flex items-center justify-center w-full h-full bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <div className="text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto" />
                <p className="text-yellow-700 text-sm">
                  Type de jeu "{campaign.type}" non supporté
                </p>
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error('Erreur lors du rendu du jeu:', error);
      return (
        <div className="flex items-center justify-center w-full h-full bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-red-700 text-sm">Erreur de rendu du jeu</p>
            <p className="text-red-600 text-xs">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center animate-fade-in"
      style={containerStyles}
    >
      {renderGameComponent()}
    </div>
  );
};

export default memo(GameCanvasPreview);
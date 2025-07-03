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
  // Calcul optimisé des dimensions basé sur le device
  const gameDimensions = useMemo(() => {
    const baseSize = previewDevice === 'mobile' ? 280 : previewDevice === 'tablet' ? 400 : 500;
    const gameSize = campaign?.gameSize || 'medium';
    
    const sizeMultipliers: Record<string, number> = {
      small: 0.8,
      medium: 1,
      large: 1.2,
      xlarge: 1.4
    };
    
    const finalSize = Math.floor(baseSize * (sizeMultipliers[gameSize] || 1));
    
    return {
      width: finalSize,
      height: finalSize
    };
  }, [previewDevice, campaign?.gameSize]);

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
    
    console.log('GameCanvasPreview - Config générée:', config);
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
      gamePosition: campaign.gamePosition || 'center'
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
      className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden animate-fade-in"
      style={{
        width: gameDimensions.width,
        height: gameDimensions.height,
        minWidth: 200,
        minHeight: 200
      }}
    >
      {renderGameComponent()}
    </div>
  );
};

export default memo(GameCanvasPreview);
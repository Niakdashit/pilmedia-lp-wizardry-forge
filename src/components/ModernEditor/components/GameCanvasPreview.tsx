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
  // Device-specific styles and dimensions
  const deviceStyles = useMemo(() => {
    switch (previewDevice) {
      case 'mobile':
        return {
          containerClass: 'bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl',
          screenClass: 'bg-black rounded-[2rem] p-1',
          innerClass: 'bg-white rounded-[1.5rem] overflow-auto relative',
          maxWidth: 550,  // Taille Qualifio-like pour mobile
          maxHeight: 1000, // Taille Qualifio-like pour mobile
          showNotch: true,
          showHomeIndicator: true
        };
      case 'tablet':
        return {
          containerClass: 'bg-gray-800 rounded-2xl p-4 shadow-2xl',
          screenClass: 'bg-black rounded-xl p-2',
          innerClass: 'bg-white rounded-lg overflow-auto relative',
          maxWidth: 1000,  // Taille Qualifio-like pour tablette
          maxHeight: 1400, // Taille Qualifio-like pour tablette
          showNotch: false,
          showHomeIndicator: false
        };
      default:
        return {
          containerClass: 'w-full h-full',
          screenClass: 'w-full h-full',
          innerClass: 'w-full h-full overflow-hidden relative',
          maxWidth: '100%',
          maxHeight: '100%',
          showNotch: false,
          showHomeIndicator: false
        };
    }
  }, [previewDevice]);

  // Game content styles with positioning
  const gameContentStyles = useMemo(() => {
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
      backgroundColor: campaign?.design?.backgroundColor || campaign?.design?.background || '#f3f4f6',
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
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
    <div className="w-full h-full flex items-center justify-center">
      {previewDevice === 'desktop' ? (
        // Desktop - full size preview with white container
        <div className="w-full h-full p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 w-full h-full flex items-center justify-center overflow-hidden">
            <div 
              className="w-full h-full animate-fade-in"
              style={gameContentStyles}
            >
              {renderGameComponent()}
            </div>
          </div>
        </div>
      ) : (
        // Mobile/Tablet - device frame only, no white container
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className={deviceStyles.containerClass}>
            <div className={deviceStyles.screenClass}>
              <div className={deviceStyles.innerClass}>
                {/* Device-specific elements */}
                {deviceStyles.showNotch && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-b-lg z-20"></div>
                )}
                
                {deviceStyles.showNotch && (
                  <div className="absolute top-1 left-2 right-2 flex justify-between items-center text-xs font-medium z-20 text-black">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 border border-black rounded-sm">
                        <div className="w-3 h-1 bg-green-500 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Game content - direct style application */}
                <div 
                  className="w-full h-full animate-fade-in overflow-auto"
                  style={gameContentStyles}
                >
                  {renderGameComponent()}
                </div>
                
                {deviceStyles.showHomeIndicator && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-400 rounded-full z-20"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(GameCanvasPreview);
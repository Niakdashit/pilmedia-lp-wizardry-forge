import React from 'react';
import { AlertCircle } from 'lucide-react';
import WheelPreview from '../../GameTypes/WheelPreview';
import QuizPreview from '../../GameTypes/QuizPreview';
import ScratchPreview from '../../GameTypes/ScratchPreview';
import Jackpot from '../../GameTypes/Jackpot';
import DicePreview from '../../GameTypes/DicePreview';
import MemoryPreview from '../../GameTypes/MemoryPreview';
import PuzzlePreview from '../../GameTypes/PuzzlePreview';
import FormPreview from '../../GameTypes/FormPreview';
import { getCampaignBackgroundImage } from '../../../utils/background';

interface GameRendererProps {
  campaign: any;
  gameConfig: {
    mode: "instant_winner";
    winProbability: number;
    maxWinners: number;
    winnersCount: number;
  };
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  disableForm: boolean;
  onGameFinish?: (result: any) => void;
}

const GameRenderer: React.FC<GameRendererProps> = ({
  campaign,
  gameConfig,
  previewDevice,
  disableForm,
  onGameFinish
}) => {
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
    onFinish: onGameFinish,
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

      case 'jackpot': {
        const gameBackgroundImage = getCampaignBackgroundImage(campaign, previewDevice);
        const buttonLabel =
          campaign.gameConfig?.jackpot?.buttonLabel || campaign.buttonConfig?.text;
        const buttonColor =
          campaign.buttonConfig?.color || campaign.gameConfig?.jackpot?.buttonColor;

        return (
          <Jackpot
            /* Enable interactive jackpot rendering in preview */
            isPreview
            instantWinConfig={campaign.gameConfig?.jackpot?.instantWin}
            buttonLabel={buttonLabel}
            buttonColor={buttonColor}
            backgroundImage={gameBackgroundImage}
            containerBackgroundColor={campaign.gameConfig?.jackpot?.containerBackgroundColor}
            backgroundColor={campaign.gameConfig?.jackpot?.backgroundColor}
            borderStyle={campaign.gameConfig?.jackpot?.borderStyle || 'classic'}
            slotBorderColor={campaign.gameConfig?.jackpot?.slotBorderColor}
            slotBorderWidth={campaign.gameConfig?.jackpot?.slotBorderWidth}
            slotBackgroundColor={campaign.gameConfig?.jackpot?.slotBackgroundColor}
            disabled={disableForm}
            onFinish={onGameFinish}
            key={`jackpot-${campaign._lastUpdate || Date.now()}`}
          />
        );
      }

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

export default GameRenderer;

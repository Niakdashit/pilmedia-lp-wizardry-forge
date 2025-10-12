
import React from 'react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';
import WheelConfiguration from '../WheelConfiguration';
import JackpotConfiguration from './JackpotConfiguration';
import QuizConfiguration from './QuizConfiguration';
import ScratchConfiguration from './ScratchConfiguration';
import DiceConfiguration from './DiceConfiguration';
import FormConfiguration from './FormConfiguration';
import { AlertCircle } from 'lucide-react';

const GameConfigSelector: React.FC = () => {
  const { selectedGameType } = useQuickCampaignStore();

  if (!selectedGameType) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-600">Veuillez d'abord sélectionner un type de jeu</p>
        </div>
      </div>
    );
  }

  switch (selectedGameType) {
    case 'wheel':
      return <WheelConfiguration />;
    case 'jackpot':
      return <JackpotConfiguration />;
    case 'quiz':
      return <QuizConfiguration />;
    case 'scratch':
      return <ScratchConfiguration />;
    case 'dice':
      return <DiceConfiguration />;
    case 'form':
      return <FormConfiguration />;
    default:
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto" />
            <p className="text-gray-600">
              Configuration non disponible pour le jeu "{selectedGameType}"
            </p>
          </div>
        </div>
      );
  }
};

export default GameConfigSelector;


import React from 'react';
import WheelGameConfig from './GameConfigs/WheelGameConfig';
import JackpotGameConfig from './GameConfigs/JackpotGameConfig';
import MemoryGameConfig from './GameConfigs/MemoryGameConfig';
import PuzzleGameConfig from './GameConfigs/PuzzleGameConfig';
import QuizGameConfig from './GameConfigs/QuizGameConfig';
import DiceGameConfig from './GameConfigs/DiceGameConfig';
import ScratchGameConfig from './GameConfigs/ScratchGameConfig';

interface ModernGameTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernGameTab: React.FC<ModernGameTabProps> = ({
  campaign,
  setCampaign
}) => {
  const renderGameConfig = () => {
    switch (campaign.type) {
      case 'wheel':
        return <WheelGameConfig campaign={campaign} setCampaign={setCampaign} />;
      case 'jackpot':
        return <JackpotGameConfig campaign={campaign} setCampaign={setCampaign} />;
      case 'memory':
        return <MemoryGameConfig campaign={campaign} setCampaign={setCampaign} />;
      case 'puzzle':
        return <PuzzleGameConfig campaign={campaign} setCampaign={setCampaign} />;
      case 'quiz':
        return <QuizGameConfig campaign={campaign} setCampaign={setCampaign} />;
      case 'dice':
        return <DiceGameConfig campaign={campaign} setCampaign={setCampaign} />;
      case 'scratch':
        return <ScratchGameConfig campaign={campaign} setCampaign={setCampaign} />;
      default:
        return <div className="text-gray-500">Configuration non disponible pour ce type de jeu</div>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration du jeu</h2>
        <p className="text-gray-600 text-sm">Configurez les paramètres de votre jeu et gérez les segments et lots à gagner</p>
      </div>

      {/* Configuration générale */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Configuration générale</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille du jeu
              </label>
              <select
                value={campaign.gameSize || 'medium'}
                onChange={(e) => setCampaign((prev: any) => ({ ...prev, gameSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
              >
                <option value="small">Petit</option>
                <option value="medium">Moyen</option>
                <option value="large">Grand</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position du jeu
              </label>
              <select
                value={campaign.gamePosition || 'center'}
                onChange={(e) => setCampaign((prev: any) => ({ ...prev, gamePosition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
                <option value="top">Haut</option>
                <option value="bottom">Bas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte du bouton principal
            </label>
            <input
              type="text"
              value={campaign.buttonConfig?.text || 'Jouer'}
              onChange={(e) => setCampaign((prev: any) => ({
                ...prev,
                buttonConfig: { ...prev.buttonConfig, text: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4dbe8] focus:border-transparent"
              placeholder="Jouer"
            />
          </div>
        </div>
      </div>

      {/* Configuration spécifique au jeu */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Configuration spécifique</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {renderGameConfig()}
        </div>
      </div>
    </div>
  );
};

export default ModernGameTab;


import React from 'react';
import { Gamepad2 } from 'lucide-react';
import WheelGameConfig from './GameConfigs/WheelGameConfig';
import JackpotGameConfig from './GameConfigs/JackpotGameConfig';
import MemoryGameConfig from './GameConfigs/MemoryGameConfig';
import PuzzleGameConfig from './GameConfigs/PuzzleGameConfig';
import QuizGameConfig from './GameConfigs/QuizGameConfig';
import DiceGameConfig from './GameConfigs/DiceGameConfig';
import ScratchGameConfig from './GameConfigs/ScratchGameConfig';
import GameSizeSelector, { GameSize } from '../configurators/GameSizeSelector';
import GamePositionSelector, { GamePosition } from '../configurators/GamePositionSelector';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Gamepad2 className="w-6 h-6 mr-2 text-[#841b60]" />
          Configuration du jeu
        </h2>
        <p className="text-gray-600">Configurez votre jeu, sa taille et sa position</p>
      </div>

      {/* Configuration générale - Taille et position */}
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Configuration générale</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Taille du jeu</h4>
            <GameSizeSelector
              selectedSize={campaign.gameSize || 'medium'}
              onSizeChange={(size: GameSize) => setCampaign((prev: any) => ({ ...prev, gameSize: size }))}
            />
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Position du jeu</h4>
            <GamePositionSelector
              selectedPosition={campaign.gamePosition || 'center'}
              onPositionChange={(position: GamePosition) => setCampaign((prev: any) => ({ ...prev, gamePosition: position }))}
            />
          </div>
        </div>

        {/* Configuration du bouton de jeu */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Bouton de jeu</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Texte du bouton</label>
              <input
                type="text"
                value={campaign.buttonConfig?.text || 'Jouer'}
                onChange={(e) => setCampaign((prev: any) => ({
                  ...prev,
                  buttonConfig: { ...prev.buttonConfig, text: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                placeholder="Jouer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Couleur du bouton</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={campaign.buttonConfig?.backgroundColor || '#841b60'}
                  onChange={(e) => setCampaign((prev: any) => ({
                    ...prev,
                    buttonConfig: { ...prev.buttonConfig, backgroundColor: e.target.value }
                  }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={campaign.buttonConfig?.backgroundColor || '#841b60'}
                  onChange={(e) => setCampaign((prev: any) => ({
                    ...prev,
                    buttonConfig: { ...prev.buttonConfig, backgroundColor: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration spécifique au jeu */}
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Configuration spécifique</h3>
        <p className="text-sm text-gray-600">Paramètres avancés spécifiques à votre type de jeu</p>
        {renderGameConfig()}
      </div>
    </div>
  );
};

export default ModernGameTab;

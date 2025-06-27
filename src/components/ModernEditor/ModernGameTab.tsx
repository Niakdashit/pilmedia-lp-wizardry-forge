
import React from 'react';
import WheelGameConfig from './GameConfigs/WheelGameConfig';
import JackpotGameConfig from './GameConfigs/JackpotGameConfig';
import MemoryGameConfig from './GameConfigs/MemoryGameConfig';
import PuzzleGameConfig from './GameConfigs/PuzzleGameConfig';
import QuizGameConfig from './GameConfigs/QuizGameConfig';
import DiceGameConfig from './GameConfigs/DiceGameConfig';
import ScratchGameConfig from './GameConfigs/ScratchGameConfig';
import GameSizeSelector, { GameSize } from '../configurators/GameSizeSelector';
import GamePositionSelector, { GamePosition } from '../configurators/GamePositionSelector';
import { Gamepad2, Maximize2, MousePointer } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Gamepad2 className="w-6 h-6 mr-2" />
          Configuration du jeu
        </h2>
        <p className="text-sm text-gray-600">
          Paramètres, taille et position de votre jeu
        </p>
      </div>

      {/* Taille et position */}
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Maximize2 className="w-4 h-4 mr-2" />
          Taille et position
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <GameSizeSelector
              selectedSize={campaign.gameSize || 'medium'}
              onSizeChange={(size: GameSize) => setCampaign((prev: any) => ({ ...prev, gameSize: size }))}
            />
          </div>
          
          <div>
            <GamePositionSelector
              selectedPosition={campaign.gamePosition || 'center'}
              onPositionChange={(position: GamePosition) => setCampaign((prev: any) => ({ ...prev, gamePosition: position }))}
            />
          </div>
        </div>
      </div>

      {/* Configuration du bouton */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <MousePointer className="w-4 h-4 mr-2" />
          Bouton du jeu
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Texte du bouton</label>
            <input
              type="text"
              value={campaign.buttonConfig?.text || 'Jouer'}
              onChange={(e) => setCampaign((prev: any) => ({
                ...prev,
                buttonConfig: { ...prev.buttonConfig, text: e.target.value }
              }))}
              placeholder="Texte du bouton"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleur</label>
            <input
              type="color"
              value={campaign.buttonConfig?.color || '#841b60'}
              onChange={(e) => setCampaign((prev: any) => ({
                ...prev,
                buttonConfig: { ...prev.buttonConfig, color: e.target.value }
              }))}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Style</label>
            <select
              value={campaign.buttonConfig?.style || 'solid'}
              onChange={(e) => setCampaign((prev: any) => ({
                ...prev,
                buttonConfig: { ...prev.buttonConfig, style: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            >
              <option value="solid">Plein</option>
              <option value="outline">Contour</option>
              <option value="gradient">Dégradé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuration spécifique au jeu */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Paramètres spécifiques</h3>
        {renderGameConfig()}
      </div>
    </div>
  );
};

export default ModernGameTab;

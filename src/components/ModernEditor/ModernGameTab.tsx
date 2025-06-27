
import React from 'react';
import WheelGameConfig from './GameConfigs/WheelGameConfig';
import JackpotGameConfig from './GameConfigs/JackpotGameConfig';
import MemoryGameConfig from './GameConfigs/MemoryGameConfig';
import PuzzleGameConfig from './GameConfigs/PuzzleGameConfig';
import QuizGameConfig from './GameConfigs/QuizGameConfig';
import DiceGameConfig from './GameConfigs/DiceGameConfig';
import ScratchGameConfig from './GameConfigs/ScratchGameConfig';
import ModernGameConfigTab from './ModernGameConfigTab';

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
      {/* Configuration du jeu et positionnement */}
      <ModernGameConfigTab
        gameSize={campaign.gameSize || 'medium'}
        gamePosition={campaign.gamePosition || 'center'}
        onGameSizeChange={(size) => setCampaign((prev: any) => ({ ...prev, gameSize: size }))}
        onGamePositionChange={(position) => setCampaign((prev: any) => ({ ...prev, gamePosition: position }))}
        buttonConfig={campaign.buttonConfig || {}}
        onButtonConfigChange={(config) => setCampaign((prev: any) => ({ ...prev, buttonConfig: config }))}
      />

      {/* Configuration spécifique au jeu */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Configuration spécifique</h3>
        {renderGameConfig()}
      </div>
    </div>
  );
};

export default ModernGameTab;

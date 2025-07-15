import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';
import WheelMechanicConfig from './GameMechanics/WheelMechanicConfig';
import QuizMechanicConfig from './GameMechanics/QuizMechanicConfig';
import ScratchMechanicConfig from './GameMechanics/ScratchMechanicConfig';
import JackpotMechanicConfig from './GameMechanics/JackpotMechanicConfig';
import DiceMechanicConfig from './GameMechanics/DiceMechanicConfig';
import MemoryMechanicConfig from './GameMechanics/MemoryMechanicConfig';
import PuzzleMechanicConfig from './GameMechanics/PuzzleMechanicConfig';
import FormMechanicConfig from './GameMechanics/FormMechanicConfig';

interface GameMechanicsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const GameMechanicsTab: React.FC<GameMechanicsTabProps> = ({ config, onConfigUpdate }) => {
  const renderGameConfig = () => {
    switch (config.gameType) {
      case 'wheel':
        return <WheelMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      case 'quiz':
        return <QuizMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      case 'scratch':
        return <ScratchMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      case 'jackpot':
        return <JackpotMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      case 'dice':
        return <DiceMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      case 'memory':
        return <MemoryMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      case 'puzzle':
        return <PuzzleMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      case 'form':
        return <FormMechanicConfig config={config} onConfigUpdate={onConfigUpdate} />;
      default:
        return (
          <div className="premium-card">
            <p className="text-center text-sidebar-text-muted">
              Configuration non disponible pour ce type de jeu
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="section-title">Configuration de la mécanique</h3>
      {renderGameConfig()}
    </div>
  );
};

export default GameMechanicsTab;
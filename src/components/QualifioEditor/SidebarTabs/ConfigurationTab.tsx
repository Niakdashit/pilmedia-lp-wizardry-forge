
import React from 'react';
import { Target, HelpCircle, Cookie, Dice6, Brain, Puzzle, FileText, Gamepad2, Calendar, Clock, Link } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';
import WheelMechanicConfig from './GameMechanics/WheelMechanicConfig';
import QuizMechanicConfig from './GameMechanics/QuizMechanicConfig';
import ScratchMechanicConfig from './GameMechanics/ScratchMechanicConfig';
import JackpotMechanicConfig from './GameMechanics/JackpotMechanicConfig';
import DiceMechanicConfig from './GameMechanics/DiceMechanicConfig';
import MemoryMechanicConfig from './GameMechanics/MemoryMechanicConfig';
import PuzzleMechanicConfig from './GameMechanics/PuzzleMechanicConfig';
import FormMechanicConfig from './GameMechanics/FormMechanicConfig';

interface ConfigurationTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const gameTypes = [
    { value: 'wheel', label: 'Roue de la fortune', icon: Target },
    { value: 'quiz', label: 'Quiz', icon: HelpCircle },
    { value: 'scratch', label: 'Carte à gratter', icon: Cookie },
    { value: 'jackpot', label: 'Machine à sous', icon: Target },
    { value: 'dice', label: 'Dés', icon: Dice6 },
    { value: 'memory', label: 'Memory', icon: Brain },
    { value: 'puzzle', label: 'Puzzle', icon: Puzzle },
    { value: 'form', label: 'Formulaire', icon: FileText }
  ];

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
        return null;
    }
  };

  return (
    <div className="space-y-6 my-[30px]">
      <h3 className="section-title text-center font-semibold">Configuration</h3>
      
      {/* Game Type Selection */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Gamepad2 className="w-4 h-4" />
          Type de jeu
        </h4>
        
        <div className="form-group-premium">
          <label>Sélectionnez votre mécanique</label>
          <select 
            value={config.gameType} 
            onChange={e => onConfigUpdate({
              gameType: e.target.value as EditorConfig['gameType']
            })}
          >
            {gameTypes.map(gameType => (
              <option key={gameType.value} value={gameType.value}>
                {gameType.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Game Mode Configuration */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres généraux</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Mode de jeu</label>
            <select 
              value={config.gameMode} 
              onChange={e => onConfigUpdate({
                gameMode: e.target.value as EditorConfig['gameMode']
              })}
            >
              <option value="mode1-sequential">Mode 1 - Séquentiel (Descriptif + Zone de jeu)</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Mode d'affichage</label>
            <select 
              value={config.displayMode} 
              onChange={e => onConfigUpdate({
                displayMode: e.target.value as EditorConfig['displayMode']
              })}
            >
              <option value="mode1-banner-game">Mode 1 - Bannière + zone de texte</option>
              <option value="mode2-background">Mode 2 - Fond seul (paysage)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaign Settings */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Paramètres de campagne
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Nom de la campagne</label>
            <input
              type="text"
              value={config.campaignName || ''}
              onChange={e => onConfigUpdate({ campaignName: e.target.value })}
              placeholder="Nom de votre campagne"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group-premium">
              <label>Date de début</label>
              <input
                type="date"
                value={config.startDate || ''}
                onChange={e => onConfigUpdate({ startDate: e.target.value })}
              />
            </div>
            <div className="form-group-premium">
              <label>Date de fin</label>
              <input
                type="date"
                value={config.endDate || ''}
                onChange={e => onConfigUpdate({ endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group-premium">
              <label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Heure de début
              </label>
              <input
                type="time"
                value={config.startTime || ''}
                onChange={e => onConfigUpdate({ startTime: e.target.value })}
              />
            </div>
            <div className="form-group-premium">
              <label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Heure de fin
              </label>
              <input
                type="time"
                value={config.endTime || ''}
                onChange={e => onConfigUpdate({ endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL de la campagne
            </label>
            <input
              type="url"
              value={config.campaignUrl || ''}
              onChange={e => onConfigUpdate({ campaignUrl: e.target.value })}
              placeholder="https://votre-site.com/campagne"
            />
          </div>
        </div>
      </div>

      {/* Game Specific Configuration */}
      {renderGameConfig()}
    </div>
  );
};

export default ConfigurationTab;

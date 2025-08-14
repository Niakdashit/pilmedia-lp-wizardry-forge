import React from 'react';
import { Target, HelpCircle, Cookie, Dice6, Brain, Puzzle, FileText } from 'lucide-react';
import type { EditorConfig } from '../GameEditorLayout';
interface GeneralTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
const GeneralTab: React.FC<GeneralTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const gameTypes = [{
    value: 'wheel',
    label: 'Roue de la fortune',
    icon: Target
  }, {
    value: 'quiz',
    label: 'Quiz',
    icon: HelpCircle
  }, {
    value: 'scratch',
    label: 'Carte à gratter',
    icon: Cookie
  }, {
    value: 'jackpot',
    label: 'Machine à sous',
    icon: Target
  }, {
    value: 'dice',
    label: 'Dés',
    icon: Dice6
  }, {
    value: 'memory',
    label: 'Memory',
    icon: Brain
  }, {
    value: 'puzzle',
    label: 'Puzzle',
    icon: Puzzle
  }, {
    value: 'form',
    label: 'Formulaire',
    icon: FileText
  }];
  return <div className="space-y-6 my-[30px]">
      <h3 className="section-title text-center font-semibold">Configuration générale</h3>
      
      {/* Game Type Selection */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Mécanique de jeu</h4>
        
        <div className="form-group-premium">
          <label>Type de jeu</label>
          <select value={config.gameType} onChange={e => onConfigUpdate({
          gameType: e.target.value as EditorConfig['gameType']
        })}>
            {gameTypes.map(gameType => <option key={gameType.value} value={gameType.value}>
                {gameType.label}
              </option>)}
          </select>
        </div>
      </div>
      
      {/* Game Configuration */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du jeu</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Mode de jeu</label>
            <select value={config.gameMode} onChange={e => onConfigUpdate({
            gameMode: e.target.value as EditorConfig['gameMode']
          })}>
              <option value="mode1-sequential">Mode 1 - Séquentiel (Descriptif + Zone de jeu)</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Mode d'affichage</label>
            <select value={config.displayMode} onChange={e => onConfigUpdate({
            displayMode: e.target.value as EditorConfig['displayMode']
          })}>
              <option value="mode1-banner-game">Mode 1 - Bannière + zone de texte</option>
              <option value="mode2-background">Mode 2 - Fond seul (paysage)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      

      {/* Banner Configuration */}
      

      {/* Colors */}
      

      {/* Wheel Border Style */}
      
    </div>;
};
export default GeneralTab;
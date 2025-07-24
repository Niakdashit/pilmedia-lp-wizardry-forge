
import React from 'react';
import { Settings, Calendar, Globe, Hash } from 'lucide-react';
import type { EditorConfig } from '../GameEditorLayout';

interface ConfigurationTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = ({
  config,
  onConfigUpdate
}) => {
  return (
    <div className="space-y-6 py-0 my-[30px]">
      <h3 className="section-title text-center">Configuration générale</h3>
      
      {/* Informations de campagne */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Informations de campagne
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Nom de la campagne</label>
            <input
              type="text"
              value={config.campaignName || ''}
              onChange={e => onConfigUpdate({ campaignName: e.target.value })}
              placeholder="Ma campagne de jeu"
            />
          </div>

          <div className="form-group-premium">
            <label>URL de la campagne</label>
            <input
              type="text"
              value={config.campaignUrl || ''}
              onChange={e => onConfigUpdate({ campaignUrl: e.target.value })}
              placeholder="ma-campagne-jeu"
            />
          </div>
        </div>
      </div>

      {/* Planification */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Planification
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group-premium">
              <label>Heure de début</label>
              <input
                type="time"
                value={config.startTime || ''}
                onChange={e => onConfigUpdate({ startTime: e.target.value })}
              />
            </div>
            <div className="form-group-premium">
              <label>Heure de fin</label>
              <input
                type="time"
                value={config.endTime || ''}
                onChange={e => onConfigUpdate({ endTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Type de jeu */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Type de jeu
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Jeu sélectionné</label>
            <select
              value={config.gameType}
              onChange={e => onConfigUpdate({ gameType: e.target.value as any })}
            >
              <option value="wheel">Roue de la fortune</option>
              <option value="quiz">Quiz</option>
              <option value="scratch">Carte à gratter</option>
              <option value="jackpot">Jackpot</option>
              <option value="dice">Dés</option>
              <option value="memory">Memory</option>
              <option value="puzzle">Puzzle</option>
              <option value="form">Formulaire</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Mode d'affichage</label>
            <select
              value={config.displayMode}
              onChange={e => onConfigUpdate({ displayMode: e.target.value as any })}
            >
              <option value="mode1-banner-game">Mode 1 - Bannière + Jeu</option>
              <option value="mode2-background">Mode 2 - Arrière-plan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuration du conteneur */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Dimensions du conteneur
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group-premium">
              <label>Largeur (px)</label>
              <input
                type="number"
                value={config.width}
                onChange={e => onConfigUpdate({ width: parseInt(e.target.value) || 810 })}
                min="300"
                max="1200"
                step="10"
              />
            </div>
            <div className="form-group-premium">
              <label>Hauteur (px)</label>
              <input
                type="number"
                value={config.height}
                onChange={e => onConfigUpdate({ height: parseInt(e.target.value) || 1200 })}
                min="400"
                max="2000"
                step="10"
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Type d'ancrage</label>
            <select
              value={config.anchor}
              onChange={e => onConfigUpdate({ anchor: e.target.value as 'fixed' | 'center' })}
            >
              <option value="fixed">Position fixe</option>
              <option value="center">Centré</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationTab;

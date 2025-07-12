import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface GameZoneTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const GameZoneTab: React.FC<GameZoneTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Apparence</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Largeur (%)
            </label>
            <input
              type="number"
              defaultValue={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hauteur minimum (px)
            </label>
            <input
              type="number"
              defaultValue={400}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="centerText"
                checked={config.centerText || false}
                onChange={(e) => onConfigUpdate({ centerText: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="centerText" className="text-sm text-gray-700">
                Centrer le texte
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="centerForm"
                checked={config.centerForm || false}
                onChange={(e) => onConfigUpdate({ centerForm: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="centerForm" className="text-sm text-gray-700">
                Centrer le questionnaire
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="centerGameZone"
                checked={config.centerGameZone || false}
                onChange={(e) => onConfigUpdate({ centerGameZone: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="centerGameZone" className="text-sm text-gray-700">
                Centrer le formulaire
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de fond du concours
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.backgroundColor || '#ffffff'}
                onChange={(e) => onConfigUpdate({ backgroundColor: e.target.value })}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.backgroundColor || '#ffffff'}
                onChange={(e) => onConfigUpdate({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <button className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">
          + Positionnement avancé
        </button>
      </div>
    </div>
  );
};

export default GameZoneTab;
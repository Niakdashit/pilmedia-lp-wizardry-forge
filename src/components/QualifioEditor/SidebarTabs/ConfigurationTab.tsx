
import React from 'react';
import { Target, HelpCircle, Cookie, Dice6, Brain, Puzzle, FileText } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

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

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Configuration générale</h3>
      
      {/* Game Type Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Type de jeu</h4>
        <select 
          value={config.gameType} 
          onChange={(e) => onConfigUpdate({ gameType: e.target.value as EditorConfig['gameType'] })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          {gameTypes.map(gameType => (
            <option key={gameType.value} value={gameType.value}>
              {gameType.label}
            </option>
          ))}
        </select>
      </div>

      {/* Display Mode */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Mode d'affichage</h4>
        <select 
          value={config.displayMode} 
          onChange={(e) => onConfigUpdate({ displayMode: e.target.value as EditorConfig['displayMode'] })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
        >
          <option value="mode1-banner-game">Mode 1 - Bannière + zone de texte</option>
          <option value="mode2-background">Mode 2 - Fond seul (paysage)</option>
        </select>
      </div>

      {/* Campaign Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Informations de la campagne</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nom de la campagne</label>
            <input
              type="text"
              value={config.campaignName || ''}
              onChange={(e) => onConfigUpdate({ campaignName: e.target.value })}
              placeholder="Ma nouvelle campagne"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Description</label>
            <textarea
              value={config.storyText || ''}
              onChange={(e) => onConfigUpdate({ storyText: e.target.value })}
              placeholder="Décrivez votre campagne..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Dimensions</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Largeur</label>
            <input
              type="number"
              value={config.width}
              onChange={(e) => onConfigUpdate({ width: parseInt(e.target.value) || 810 })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Hauteur</label>
            <input
              type="number"
              value={config.height}
              onChange={(e) => onConfigUpdate({ height: parseInt(e.target.value) || 1200 })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationTab;

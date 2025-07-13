import React from 'react';
import BorderStyleSelector from '../../SmartWheel/components/BorderStyleSelector';
import type { EditorConfig } from '../QualifioEditorLayout';

interface GeneralTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration générale</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de jeu
            </label>
            <select
              value={config.gameMode}
              onChange={(e) => onConfigUpdate({ gameMode: e.target.value as EditorConfig['gameMode'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mode1-sequential">Mode 1 - Séquentiel (Descriptif + Zone de jeu)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode d'affichage
            </label>
            <select
              value={config.displayMode}
              onChange={(e) => onConfigUpdate({ displayMode: e.target.value as EditorConfig['displayMode'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mode1-banner-game">Mode 1 - Bannière + zone de texte</option>
              <option value="mode2-background">Mode 2 - Fond seul (paysage)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Largeur (px)
        </label>
        <input
          type="number"
          value={config.width}
          onChange={(e) => onConfigUpdate({ width: parseInt(e.target.value) || 810 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hauteur (px)
        </label>
        <input
          type="number"
          value={config.height}
          onChange={(e) => onConfigUpdate({ height: parseInt(e.target.value) || 1200 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ancre
        </label>
        <select
          value={config.anchor}
          onChange={(e) => onConfigUpdate({ anchor: e.target.value as 'fixed' | 'center' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="fixed">Fixe</option>
          <option value="center">Centre</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bannière
        </label>
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            {config.bannerImage ? (
              <img src={config.bannerImage} alt="Banner" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-gray-500">Image de bannière</span>
            )}
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Description de l'image</label>
            <textarea
              value={config.bannerDescription || ''}
              onChange={(e) => onConfigUpdate({ bannerDescription: e.target.value })}
              placeholder="Description de l'image"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Lien de la bannière (facultatif)</label>
            <input
              type="url"
              value={config.bannerLink || ''}
              onChange={(e) => onConfigUpdate({ bannerLink: e.target.value })}
              placeholder="https://www.qualifio.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Couleur de fond</label>
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
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Outline color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.outlineColor || '#ffffff'}
                  onChange={(e) => onConfigUpdate({ outlineColor: e.target.value })}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.outlineColor || '#ffffff'}
                  onChange={(e) => onConfigUpdate({ outlineColor: e.target.value })}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style de bordure de la roue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Style de bordure de la roue
        </label>
        <BorderStyleSelector
          currentStyle={config.borderStyle || 'classic'}
          onStyleChange={(style) => onConfigUpdate({ borderStyle: style })}
        />
      </div>
    </div>
  );
};

export default GeneralTab;
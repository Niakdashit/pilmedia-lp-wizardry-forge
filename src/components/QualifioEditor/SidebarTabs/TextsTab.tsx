import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface TextsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const TextsTab: React.FC<TextsTabProps> = ({ config, onConfigUpdate }) => {
  const fontOptions = [
    'Raleway',
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Verdana'
  ];

  return (
    <div className="space-y-8">
      {/* General Text Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Général</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={config.contentSize || 16}
                onChange={(e) => onConfigUpdate({ contentSize: parseInt(e.target.value) || 16 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.contentColor || '#000000'}
                onChange={(e) => onConfigUpdate({ contentColor: e.target.value })}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.contentColor || '#000000'}
                onChange={(e) => onConfigUpdate({ contentColor: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Police
          </label>
          <select
            value={config.contentFont || 'Raleway'}
            onChange={(e) => onConfigUpdate({ contentFont: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur des liens
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              defaultValue="#b22222"
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              defaultValue="b22222"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Title Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Titre</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="showTitle"
            defaultChecked={true}
            className="rounded border-gray-300"
          />
          <label htmlFor="showTitle" className="text-sm text-gray-700">
            Afficher le titre de la campagne
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={config.titleSize || 42}
                onChange={(e) => onConfigUpdate({ titleSize: parseInt(e.target.value) || 42 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.titleColor || '#000000'}
                onChange={(e) => onConfigUpdate({ titleColor: e.target.value })}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.titleColor || '#000000'}
                onChange={(e) => onConfigUpdate({ titleColor: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Police
          </label>
          <select
            value={config.titleFont || 'Raleway'}
            onChange={(e) => onConfigUpdate({ titleFont: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Graisse
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="bolder">Bolder</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TextsTab;
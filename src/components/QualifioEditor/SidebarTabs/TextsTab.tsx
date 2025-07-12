import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface TextsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const TextsTab: React.FC<TextsTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Texte de l'histoire</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu de l'histoire
            </label>
            <textarea
              value={config.storyText || ''}
              onChange={(e) => onConfigUpdate({ storyText: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Saisissez le texte de l'histoire..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien éditeur
            </label>
            <input
              type="text"
              value={config.publisherLink || ''}
              onChange={(e) => onConfigUpdate({ publisherLink: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="editions.flammarion.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du prix
            </label>
            <textarea
              value={config.prizeText || ''}
              onChange={(e) => onConfigUpdate({ prizeText: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Description du prix à gagner..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextsTab;
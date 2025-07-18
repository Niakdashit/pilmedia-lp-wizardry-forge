
import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface ContentTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const ContentTab: React.FC<ContentTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Contenu textuel</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texte de l'histoire
          </label>
          <textarea
            value={config.storyText || ''}
            onChange={(e) => onConfigUpdate({ storyText: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Entrez le texte de votre histoire..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lien éditeur
          </label>
          <input
            type="url"
            value={config.publisherLink || ''}
            onChange={(e) => onConfigUpdate({ publisherLink: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="https://example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texte du prix
          </label>
          <input
            type="text"
            value={config.prizeText || ''}
            onChange={(e) => onConfigUpdate({ prizeText: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Décrivez le prix à gagner..."
          />
        </div>
      </div>
    </div>
  );
};

export default ContentTab;

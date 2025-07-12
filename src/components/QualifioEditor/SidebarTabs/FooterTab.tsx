import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface FooterTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const FooterTab: React.FC<FooterTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer (810 x free)
        </label>
        
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            {config.footerImage ? (
              <img src={config.footerImage} alt="Footer" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center">
                <div className="text-gray-500 mb-2">Image de footer</div>
                <div className="text-xs text-gray-400">810 x libre</div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Description de l'image</label>
            <textarea
              value={config.footerDescription || ''}
              onChange={(e) => onConfigUpdate({ footerDescription: e.target.value })}
              placeholder="Description de l'image"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Lien du footer (optionnel)</label>
            <input
              type="url"
              value={config.footerLink || ''}
              onChange={(e) => onConfigUpdate({ footerLink: e.target.value })}
              placeholder="https://www.qualifio.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <button className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">
            Ajout d'une image de fond
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Zone de jeu</h4>
        <p className="text-sm text-gray-600 mb-3">Configuration avancée de la zone de jeu</p>
        
        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border border-gray-300 hover:bg-gray-200 transition-colors">
          Configurer la zone de jeu
        </button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Textes</h4>
        <p className="text-sm text-gray-600 mb-3">Personnalisation des textes et typographie</p>
        
        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border border-gray-300 hover:bg-gray-200 transition-colors">
          Modifier les textes
        </button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Boutons</h4>
        <p className="text-sm text-gray-600 mb-3">Style et comportement des boutons</p>
        
        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border border-gray-300 hover:bg-gray-200 transition-colors">
          Personnaliser les boutons
        </button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Code personnalisé et tags</h4>
        <p className="text-sm text-gray-600 mb-3">Intégration de code HTML/CSS/JS personnalisé</p>
        
        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border border-gray-300 hover:bg-gray-200 transition-colors">
          Ajouter du code
        </button>
      </div>
    </div>
  );
};

export default FooterTab;
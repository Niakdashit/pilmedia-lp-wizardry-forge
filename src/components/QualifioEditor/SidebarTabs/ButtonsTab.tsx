import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface ButtonsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const ButtonsTab: React.FC<ButtonsTabProps> = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Boutons</h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Bouton principal</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Texte du bouton</label>
                <input
                  type="text"
                  defaultValue="PARTICIPER !"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Couleur de fond</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#dc2626"
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="dc2626"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Couleur du texte</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#ffffff"
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="ffffff"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Taille de police</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={18}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Bordure</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={0}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Menu</h4>
            <p className="text-sm text-gray-600 mb-3">Configuration des liens et boutons de navigation</p>
            
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border border-gray-300 hover:bg-gray-200 transition-colors">
              Configurer le menu
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Cases à cocher et boutons radio</h4>
            <p className="text-sm text-gray-600 mb-3">Personnalisation des éléments de formulaire</p>
            
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded border border-gray-300 hover:bg-gray-200 transition-colors">
              Configurer les options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonsTab;
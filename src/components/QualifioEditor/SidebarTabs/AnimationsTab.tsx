
import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface AnimationsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const AnimationsTab: React.FC<AnimationsTabProps> = () => {
  const [activeTab, setActiveTab] = useState<'textes' | 'images' | 'jeux'>('textes');

  const handlePlay = () => {
    // Lancer la prévisualisation des animations
    console.log('🎬 Lancement des animations');
  };

  const handleReset = () => {
    // Réinitialiser les animations
    console.log('🔄 Réinitialisation des animations');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Animations</h2>
        
        {/* Contrôles globaux */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Contrôles globaux</h3>
          <div className="flex gap-3">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Play size={16} />
              Jouer
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('textes')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'textes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Textes
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'images'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab('jeux')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'jeux'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Jeux
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 p-6">
        {activeTab === 'textes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Animations des textes</h3>
              <div className="text-center py-12 text-gray-500">
                <p>Aucun texte personnalisé à animer</p>
                <p className="text-sm mt-1">Ajoutez des textes dans l'onglet Layout</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Animations des images</h3>
              
              {/* Animation de la roue */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800">Roue de la fortune</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Animation de rotation fluide</label>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Effet de rebond</label>
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Durée de rotation (secondes)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      defaultValue={3}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">3 secondes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jeux' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Animations du jeu</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm text-gray-700">Animation d'entrée</label>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm text-gray-700">Animation de sortie</label>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm text-gray-700">Transition des éléments</label>
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationsTab;

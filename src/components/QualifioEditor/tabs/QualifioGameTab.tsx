import React from 'react';

interface QualifioGameTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioGameTab: React.FC<QualifioGameTabProps> = ({
  campaign,
  setCampaign
}) => {

  const updateGameConfig = (key: string, value: any) => {
    setCampaign({
      ...campaign,
      game: {
        ...campaign.game,
        [key]: value
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Type de jeu</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Sélectionner le jeu</label>
            <select 
              value={campaign.game?.type || 'wheel'} 
              onChange={(e) => updateGameConfig('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="wheel">Roue de la Fortune</option>
              <option value="scratch">Carte à gratter</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Configuration de la roue</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Mode d'affichage</label>
            <select 
              value={campaign.game?.wheelMode || 'mode1'} 
              onChange={(e) => updateGameConfig('wheelMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="mode1">Mode 1 - Page d'accueil puis formulaire</option>
              <option value="mode2">Mode 2 - Roue visible avec modal formulaire</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Segments de la roue</label>
            <div className="space-y-2">
              {(campaign.game?.wheelSegments || [
                { label: 'Prix 1', color: '#ff6b6b' },
                { label: 'Prix 2', color: '#4ecdc4' },
                { label: 'Prix 3', color: '#45b7d1' },
                { label: 'Essayez encore', color: '#feca57' }
              ]).map((segment: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={segment.label}
                    onChange={(e) => {
                      const newSegments = [...(campaign.game?.wheelSegments || [])];
                      newSegments[index] = { ...segment, label: e.target.value };
                      updateGameConfig('wheelSegments', newSegments);
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="Texte du segment"
                  />
                  <input
                    type="color"
                    value={segment.color}
                    onChange={(e) => {
                      const newSegments = [...(campaign.game?.wheelSegments || [])];
                      newSegments[index] = { ...segment, color: e.target.value };
                      updateGameConfig('wheelSegments', newSegments);
                    }}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Position des éléments</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Position du titre</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option>Centre</option>
              <option>Gauche</option>
              <option>Droite</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Position du sous-titre</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option>Sous le titre</option>
              <option>À côté du titre</option>
              <option>Séparé</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Style des encarts</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Couleur de fond titre</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value="#fbb6ce"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">Rose pâle</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Couleur de fond sous-titre</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value="#fef3c7"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">Beige</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Opacité des encarts</label>
            <input
              type="range"
              min="0"
              max="100"
              value="90"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>90%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioGameTab;
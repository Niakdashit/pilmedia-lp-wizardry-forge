import React from 'react';

interface QualifioGameTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioGameTab: React.FC<QualifioGameTabProps> = ({
  campaign,
  setCampaign
}) => {
  const updateBanner = (key: string, value: string) => {
    setCampaign({
      ...campaign,
      banner: {
        ...campaign.banner,
        [key]: value
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Configuration de la zone de jeu</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Titre principal</label>
            <input
              type="text"
              value={campaign.banner?.title || ''}
              onChange={(e) => updateBanner('title', e.target.value)}
              placeholder="GRAND JEU"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Sous-titre</label>
            <input
              type="text"
              value={campaign.banner?.subtitle || ''}
              onChange={(e) => updateBanner('subtitle', e.target.value)}
              placeholder="LECTURES DE L'ÉTÉ"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
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
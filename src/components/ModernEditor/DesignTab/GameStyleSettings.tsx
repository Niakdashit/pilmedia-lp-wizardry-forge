
import React from 'react';

interface GameStyleSettingsProps {
  design: any;
  setCampaign: (campaign: any) => void;
  campaign: any;
}

const GameStyleSettings: React.FC<GameStyleSettingsProps> = ({
  design,
  setCampaign,
  campaign
}) => {
  const getRadiusValue = () => {
    const raw = design.borderRadius || '8px';
    if (typeof raw === 'number') return raw;
    if (raw.includes('rem')) {
      const rem = parseFloat(raw);
      return isNaN(rem) ? 8 : rem * 16;
    }
    const num = parseInt(raw, 10);
    return isNaN(num) ? 8 : num;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Style du jeu</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur du cadre
        </label>
        <input
          type="color"
          value={design.blockColor || '#ffffff'}
          onChange={(e) =>
            setCampaign({
              ...campaign,
              design: { ...design, blockColor: e.target.value }
            })
          }
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur de bordure
        </label>
        <input
          type="color"
          value={design.borderColor || '#e5e7eb'}
          onChange={(e) =>
            setCampaign({
              ...campaign,
              design: { ...design, borderColor: e.target.value }
            })
          }
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rayon de bordure
        </label>
        <input
          type="range"
          min="0"
          max="32"
          value={getRadiusValue()}
          onChange={(e) =>
            setCampaign({
              ...campaign,
              design: { ...design, borderRadius: `${e.target.value}px` }
            })
          }
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">
          {getRadiusValue()}px
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur des boutons
        </label>
        <input
          type="color"
          value={design.buttonColor || design.primaryColor || '#d4dbe8'}
          onChange={(e) =>
            setCampaign({
              ...campaign,
              design: { ...design, buttonColor: e.target.value }
            })
          }
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur du texte des boutons
        </label>
        <input
          type="color"
          value={design.buttonTextColor || '#ffffff'}
          onChange={(e) =>
            setCampaign({
              ...campaign,
              design: { ...design, buttonTextColor: e.target.value }
            })
          }
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>
    </div>
  );
};

export default GameStyleSettings;

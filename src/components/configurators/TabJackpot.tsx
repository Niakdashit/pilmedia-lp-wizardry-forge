import React from 'react';

interface TabJackpotProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const TabJackpot: React.FC<TabJackpotProps> = ({ campaign, setCampaign }) => {
  // Add null check to prevent runtime error
  if (!campaign) {
    return <div>Loading...</div>;
  }

  const config = campaign.gameConfig?.[campaign.type] || {};

  const updateGameConfig = (key: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        [campaign.type]: {
          ...prev.gameConfig?.[campaign.type],
          [key]: value
        }
      }
    }));
  };

  const handleChange = (field: string, value: any) => {
    updateGameConfig(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Symboles du jackpot
        </label>
        <input
          type="text"
          value={config.symbols?.join(', ') || '🍒, 🍋, 🍊'}
          onChange={(e) => handleChange('symbols', e.target.value.split(', '))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          placeholder="🍒, 🍋, 🍊"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de rouleaux
        </label>
        <input
          type="number"
          value={config.reels || 3}
          onChange={(e) => handleChange('reels', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          min="3"
          max="5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message de victoire
        </label>
        <input
          type="text"
          value={config.winMessage || 'JACKPOT ! Vous avez gagné !'}
          onChange={(e) => handleChange('winMessage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message de défaite
        </label>
        <input
          type="text"
          value={config.loseMessage || 'Dommage, pas de jackpot !'}
          onChange={(e) => handleChange('loseMessage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
        />
      </div>
    </div>
  );
};

export default TabJackpot;

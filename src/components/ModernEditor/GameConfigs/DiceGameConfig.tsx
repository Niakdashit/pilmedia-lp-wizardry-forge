import React, { useState } from 'react';
import { Dices, Target, Settings } from 'lucide-react';
import ColorPaletteSelector from './ColorPaletteSelector';

interface DiceGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const DiceGameConfig: React.FC<DiceGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
  const [selectedPalette, setSelectedPalette] = useState<any>(undefined);

  const handleDiceChange = (field: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        dice: {
          ...prev.gameConfig?.dice,
          [field]: value
        }
      }
    }));
  };

  const handlePaletteSelect = (palette: any) => {
    setSelectedPalette(palette);
    
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        dice: {
          ...prev.gameConfig?.dice,
          palette: palette
        }
      }
    }));
  };

  const diceOptions = [
    { value: 1, label: '1 dé' },
    { value: 2, label: '2 dés' },
    { value: 3, label: '3 dés' }
  ];

  const sidesOptions = [
    { value: 6, label: '6 faces (classique)' },
    { value: 8, label: '8 faces' },
    { value: 10, label: '10 faces' },
    { value: 12, label: '12 faces' },
    { value: 20, label: '20 faces' }
  ];

  return (
    <div className="space-y-6">
      {/* Palette de couleurs */}
      <ColorPaletteSelector
        selectedPalette={selectedPalette}
        onPaletteSelect={handlePaletteSelect}
        gameType="dice"
      />

      {/* Nombre de dés */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Dices className="w-4 h-4 mr-2" />
          Nombre de dés
        </label>
        <div className="grid grid-cols-3 gap-2">
          {diceOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDiceChange('count', option.value)}
              className={`p-3 text-sm rounded-lg border-2 transition-all ${
                campaign.gameConfig?.dice?.count === option.value
                  ? 'border-[#841b60] bg-[#841b60]/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nombre de faces */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Settings className="w-4 h-4 mr-2" />
          Nombre de faces par dé
        </label>
        <select
          value={campaign.gameConfig?.dice?.sides || 6}
          onChange={(e) => handleDiceChange('sides', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        >
          {sidesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Conditions de victoire */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Target className="w-4 h-4 mr-2" />
          Conditions de victoire
        </label>
        
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Somme gagnante minimum</p>
            <input
              type="number"
              value={campaign.gameConfig?.dice?.winningSum || (campaign.gameConfig?.dice?.count || 2) * (campaign.gameConfig?.dice?.sides || 6)}
              onChange={(e) => handleDiceChange('winningSum', parseInt(e.target.value))}
              min={(campaign.gameConfig?.dice?.count || 2)}
              max={(campaign.gameConfig?.dice?.count || 2) * (campaign.gameConfig?.dice?.sides || 6)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#841b60] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Range: {campaign.gameConfig?.dice?.count || 2} - {(campaign.gameConfig?.dice?.count || 2) * (campaign.gameConfig?.dice?.sides || 6)}
            </p>
          </div>
        </div>
      </div>

      {/* Image de fond */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Image de fond (optionnel)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              handleDiceChange('backgroundImage', url);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        />
        {campaign.gameConfig?.dice?.backgroundImage && (
          <div className="mt-2">
            <img
              src={campaign.gameConfig.dice.backgroundImage}
              alt="Aperçu"
              className="w-full h-20 object-cover rounded border"
            />
            <button
              onClick={() => handleDiceChange('backgroundImage', '')}
              className="mt-1 text-xs text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceGameConfig;

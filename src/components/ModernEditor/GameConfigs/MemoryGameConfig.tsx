import React, { useState } from 'react';
import { Brain, Image, Clock } from 'lucide-react';
import ColorPaletteSelector from './ColorPaletteSelector';

interface MemoryGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const MemoryGameConfig: React.FC<MemoryGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
  const [selectedPalette, setSelectedPalette] = useState<any>(undefined);

  const handleMemoryChange = (field: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        memory: {
          ...prev.gameConfig?.memory,
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
        memory: {
          ...prev.gameConfig?.memory,
          palette: palette
        }
      }
    }));
  };

  const difficulties = [
    { value: 'easy', label: 'Facile (8 cartes)', pairs: 4 },
    { value: 'medium', label: 'Moyen (12 cartes)', pairs: 6 },
    { value: 'hard', label: 'Difficile (16 cartes)', pairs: 8 }
  ];

  const themes = [
    { value: 'animals', label: 'Animaux' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'colors', label: 'Couleurs' },
    { value: 'numbers', label: 'Nombres' }
  ];

  return (
    <div className="space-y-6">
      {/* Palette de couleurs */}
      <ColorPaletteSelector
        selectedPalette={selectedPalette}
        onPaletteSelect={handlePaletteSelect}
        gameType="memory"
      />

      {/* Difficulté */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Brain className="w-4 h-4 mr-2" />
          Niveau de difficulté
        </label>
        <div className="space-y-2">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => handleMemoryChange('difficulty', diff.value)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                campaign.gameConfig?.memory?.difficulty === diff.value
                  ? 'border-[#44444d] bg-[#44444d]/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium text-sm">{diff.label}</div>
              <div className="text-xs text-gray-500">{diff.pairs} paires à trouver</div>
            </button>
          ))}
        </div>
      </div>

      {/* Thème */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Image className="w-4 h-4 mr-2" />
          Thème des cartes
        </label>
        <select
          value={campaign.gameConfig?.memory?.theme || 'animals'}
          onChange={(e) => handleMemoryChange('theme', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
        >
          {themes.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chronomètre */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="timer"
            checked={campaign.gameConfig?.memory?.timer || false}
            onChange={(e) => handleMemoryChange('timer', e.target.checked)}
            className="rounded border-gray-300 text-[#44444d] focus:ring-[#44444d]"
          />
          <label htmlFor="timer" className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-1" />
            Activer le chronomètre
          </label>
        </div>

        {campaign.gameConfig?.memory?.timer && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Temps limite (secondes)</label>
            <input
              type="number"
              value={campaign.gameConfig?.memory?.timeLimit || 60}
              onChange={(e) => handleMemoryChange('timeLimit', parseInt(e.target.value))}
              min="30"
              max="300"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Image de fond personnalisée */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Image de fond (optionnel)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              handleMemoryChange('backgroundImage', url);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
        />
        {campaign.gameConfig?.memory?.backgroundImage && (
          <div className="mt-2">
            <img
              src={campaign.gameConfig.memory.backgroundImage}
              alt="Aperçu"
              className="w-full h-20 object-cover rounded border"
            />
            <button
              onClick={() => handleMemoryChange('backgroundImage', '')}
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

export default MemoryGameConfig;

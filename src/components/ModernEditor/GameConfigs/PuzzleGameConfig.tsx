import React, { useState } from 'react';
import { Grid3X3, Image, Settings } from 'lucide-react';
import ColorPaletteSelector from './ColorPaletteSelector';

interface PuzzleGameConfigProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const PuzzleGameConfig: React.FC<PuzzleGameConfigProps> = ({
  campaign,
  setCampaign
}) => {
  const [selectedPalette, setSelectedPalette] = useState<any>(undefined);

  const handlePuzzleChange = (field: string, value: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        puzzle: {
          ...prev.gameConfig?.puzzle,
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
        puzzle: {
          ...prev.gameConfig?.puzzle,
          palette: palette
        }
      }
    }));
  };

  const gridSizes = [
    { value: 9, label: '3x3 (9 pièces) - Facile' },
    { value: 16, label: '4x4 (16 pièces) - Moyen' },
    { value: 25, label: '5x5 (25 pièces) - Difficile' }
  ];

  return (
    <div className="space-y-6">
      {/* Palette de couleurs */}
      <ColorPaletteSelector
        selectedPalette={selectedPalette}
        onPaletteSelect={handlePaletteSelect}
        gameType="puzzle"
      />

      {/* Taille de la grille */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Grid3X3 className="w-4 h-4 mr-2" />
          Taille de la grille
        </label>
        <div className="space-y-2">
          {gridSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => handlePuzzleChange('pieces', size.value)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                campaign.gameConfig?.puzzle?.pieces === size.value
                  ? 'border-[#44444d] bg-[#44444d]/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium text-sm">{size.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Image du puzzle */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Image className="w-4 h-4 mr-2" />
          Image du puzzle
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              handlePuzzleChange('image', url);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
        />
        {campaign.gameConfig?.puzzle?.image && (
          <div className="mt-2">
            <img
              src={campaign.gameConfig.puzzle.image}
              alt="Aperçu du puzzle"
              className="w-full h-32 object-cover rounded border"
            />
            <button
              onClick={() => handlePuzzleChange('image', '')}
              className="mt-1 text-xs text-red-600 hover:text-red-800"
            >
              Supprimer l'image
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500">
          Téléchargez une image qui sera découpée en pièces de puzzle
        </p>
      </div>

      {/* Image de fond */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Settings className="w-4 h-4 mr-2" />
          Image de fond (optionnel)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              handlePuzzleChange('backgroundImage', url);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44444d] focus:border-transparent"
        />
        {campaign.gameConfig?.puzzle?.backgroundImage && (
          <div className="mt-2">
            <img
              src={campaign.gameConfig.puzzle.backgroundImage}
              alt="Aperçu du fond"
              className="w-full h-20 object-cover rounded border"
            />
            <button
              onClick={() => handlePuzzleChange('backgroundImage', '')}
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

export default PuzzleGameConfig;

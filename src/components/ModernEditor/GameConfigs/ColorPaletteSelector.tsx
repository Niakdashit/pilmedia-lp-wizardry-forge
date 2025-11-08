
import React from 'react';
import { Palette, RefreshCw } from 'lucide-react';

interface ColorPalette {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background?: string;
  };
}

interface ColorPaletteSelectorProps {
  selectedPalette?: ColorPalette;
  onPaletteSelect: (palette: ColorPalette) => void;
  gameType: string;
}

const colorPalettes: Record<string, ColorPalette[]> = {
  wheel: [{
    name: 'Bleu Corporate',
    colors: {
      primary: '#3B82F6',
      secondary: '#E3F2FD',
      accent: '#1E40AF'
    }
  }, {
    name: 'Vert Nature',
    colors: {
      primary: '#10B981',
      secondary: '#D1FAE5',
      accent: '#047857'
    }
  }, {
    name: 'Violet Moderne',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EDE9FE',
      accent: '#7C3AED'
    }
  }, {
    name: 'Orange Dynamique',
    colors: {
      primary: '#F97316',
      secondary: '#FED7AA',
      accent: '#EA580C'
    }
  }, {
    name: 'Rose Élégant',
    colors: {
      primary: '#EC4899',
      secondary: '#FCE7F3',
      accent: '#BE185D'
    }
  }, {
    name: 'Bleu Pastel',
    colors: {
      primary: '#60A5FA',
      secondary: '#DBEAFE',
      accent: '#2563EB'
    }
  }, {
    name: 'Turquoise Zen',
    colors: {
      primary: '#14B8A6',
      secondary: '#CCFBF1',
      accent: '#0F766E'
    }
  }, {
    name: 'Lavande Doux',
    colors: {
      primary: '#A78BFA',
      secondary: '#F3E8FF',
      accent: '#7C3AED'
    }
  }],
  scratch: [{
    name: 'Argent',
    colors: {
      primary: '#6b7280',
      secondary: '#f3f4f6',
      accent: '#374151',
      background: '#C0C0C0'
    }
  }, {
    name: 'Or',
    colors: {
      primary: '#f59e0b',
      secondary: '#fef3c7',
      accent: '#d97706',
      background: '#FFD700'
    }
  }, {
    name: 'Platine',
    colors: {
      primary: '#64748b',
      secondary: '#f1f5f9',
      accent: '#475569',
      background: '#E5E4E2'
    }
  }],
  jackpot: [{
    name: 'Vegas',
    colors: {
      primary: '#dc2626',
      secondary: '#FFD700',
      accent: '#000000',
      background: '#1f2937'
    }
  }, {
    name: 'Néon',
    colors: {
      primary: '#8b5cf6',
      secondary: '#c4b5fd',
      accent: '#7c3aed',
      background: '#1e1b4b'
    }
  }, {
    name: 'Luxe',
    colors: {
      primary: '#d4af37',
      secondary: '#ffffff',
      accent: '#b8860b',
      background: '#0f0f0f'
    }
  }],
  memory: [{
    name: 'Enfantin',
    colors: {
      primary: '#f472b6',
      secondary: '#fce7f3',
      accent: '#ec4899'
    }
  }, {
    name: 'Zen',
    colors: {
      primary: '#06b6d4',
      secondary: '#cffafe',
      accent: '#0891b2'
    }
  }, {
    name: 'Vintage',
    colors: {
      primary: '#a78bfa',
      secondary: '#ede9fe',
      accent: '#8b5cf6'
    }
  }],
  puzzle: [{
    name: 'Moderne',
    colors: {
      primary: '#0ea5e9',
      secondary: '#e0f2fe',
      accent: '#0284c7'
    }
  }, {
    name: 'Chaleureux',
    colors: {
      primary: '#f97316',
      secondary: '#ffedd5',
      accent: '#ea580c'
    }
  }, {
    name: 'Mystique',
    colors: {
      primary: '#7c3aed',
      secondary: '#f3e8ff',
      accent: '#6d28d9'
    }
  }],
  dice: [{
    name: 'Classique',
    colors: {
      primary: '#dc2626',
      secondary: '#fef2f2',
      accent: '#b91c1c'
    }
  }, {
    name: 'Digital',
    colors: {
      primary: '#06b6d4',
      secondary: '#cffafe',
      accent: '#0891b2'
    }
  }, {
    name: 'Rétro',
    colors: {
      primary: '#d97706',
      secondary: '#fef3c7',
      accent: '#b45309'
    }
  }]
};

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({
  selectedPalette,
  onPaletteSelect,
  gameType
}) => {
  const palettes = colorPalettes[gameType] || colorPalettes.wheel;

  const generateRandomPalette = () => {
    const harmonicColors = [
      // Bleus harmonieux
      '#3B82F6', '#E3F2FD', '#1E40AF',
      // Verts naturels
      '#10B981', '#D1FAE5', '#047857',
      // Violets modernes
      '#8B5CF6', '#EDE9FE', '#7C3AED',
      // Oranges dynamiques
      '#F97316', '#FED7AA', '#EA580C'
    ];
    const shuffled = [...harmonicColors].sort(() => Math.random() - 0.5);
    const randomPalette: ColorPalette = {
      name: 'Personnalisé',
      colors: {
        primary: shuffled[0],
        secondary: shuffled[1],
        accent: shuffled[2]
      }
    };
    onPaletteSelect(randomPalette);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Combinaisons de couleurs
        </h3>
        <button
          onClick={generateRandomPalette}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Aléatoire</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {palettes.map((palette, index) => (
          <button
            key={index}
            onClick={() => onPaletteSelect(palette)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPalette?.name === palette.name
                ? 'border-[#E0004D] bg-[#E0004D]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex space-x-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: palette.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: palette.colors.secondary }}
                />
                {palette.colors.accent && (
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: palette.colors.accent }}
                  />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700">{palette.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPaletteSelector;

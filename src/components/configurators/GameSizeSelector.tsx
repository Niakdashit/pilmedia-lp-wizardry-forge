
import React from 'react';

export type GameSize = 'small' | 'medium' | 'large' | 'xlarge';

export const GAME_SIZES = {
  small: { width: 300, height: 200, label: 'Petit (300×200px)' },
  medium: { width: 400, height: 300, label: 'Moyen (400×300px)' },
  large: { width: 500, height: 400, label: 'Grand (500×400px)' },
  xlarge: { width: 600, height: 500, label: 'Très Grand (600×500px)' }
} as const;

interface GameSizeSelectorProps {
  selectedSize: GameSize;
  onSizeChange: (size: GameSize) => void;
  className?: string;
}

const GameSizeSelector: React.FC<GameSizeSelectorProps> = ({
  selectedSize,
  onSizeChange,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Taille du jeu
      </label>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(GAME_SIZES).map(([key, size]) => (
          <button
            key={key}
            onClick={() => onSizeChange(key as GameSize)}
            className={`p-3 text-left border rounded-lg transition-colors ${
              selectedSize === key
                ? 'border-[#841b60] bg-[#841b60]/5 text-[#841b60]'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">{size.label}</div>
            <div className="text-sm text-gray-500">{size.width}×{size.height}px</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameSizeSelector;

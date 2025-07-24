
import React from 'react';

export type GameSize = 'small' | 'medium' | 'large' | 'xlarge';

export const GAME_SIZES = {
  small: { width: 280, height: 180, label: 'Petit (280×180px)' },
  medium: { width: 350, height: 240, label: 'Moyen (350×240px)' },
  large: { width: 420, height: 300, label: 'Grand (420×300px)' },
  xlarge: { width: 500, height: 360, label: 'Très Grand (500×360px)' }
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

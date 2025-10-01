
import React from 'react';

export type GamePosition = 'top' | 'center' | 'bottom' | 'left' | 'right';

interface GamePositionSelectorProps {
  selectedPosition: GamePosition;
  onPositionChange: (position: GamePosition) => void;
  className?: string;
}

const GamePositionSelector: React.FC<GamePositionSelectorProps> = ({
  selectedPosition,
  onPositionChange,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Position du jeu
      </label>
      <div className="grid grid-cols-3 gap-2">
        {/* Top */}
        <div></div>
        <button
          onClick={() => onPositionChange('top')}
          className={`p-2 text-xs rounded border transition-colors ${
            selectedPosition === 'top'
              ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white border-[#841b60]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#841b60]'
          }`}
        >
          Haut
        </button>
        <div></div>
        
        {/* Middle row */}
        <button
          onClick={() => onPositionChange('left')}
          className={`p-2 text-xs rounded border transition-colors ${
            selectedPosition === 'left'
              ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white border-[#841b60]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#841b60]'
          }`}
        >
          Gauche
        </button>
        <button
          onClick={() => onPositionChange('center')}
          className={`p-2 text-xs rounded border transition-colors ${
            selectedPosition === 'center'
              ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white border-[#841b60]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#841b60]'
          }`}
        >
          Centre
        </button>
        <button
          onClick={() => onPositionChange('right')}
          className={`p-2 text-xs rounded border transition-colors ${
            selectedPosition === 'right'
              ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white border-[#841b60]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#841b60]'
          }`}
        >
          Droite
        </button>
        
        {/* Bottom */}
        <div></div>
        <button
          onClick={() => onPositionChange('bottom')}
          className={`p-2 text-xs rounded border transition-colors ${
            selectedPosition === 'bottom'
              ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white border-[#841b60]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#841b60]'
          }`}
        >
          Bas
        </button>
        <div></div>
      </div>
    </div>
  );
};

export default GamePositionSelector;


import React from 'react';

export type GamePosition = 'top' | 'center' | 'bottom' | 'left' | 'right';

interface GamePositionSelectorProps {
  selectedPosition: GamePosition;
  onPositionChange: (position: GamePosition) => void;
}

const GamePositionSelector: React.FC<GamePositionSelectorProps> = ({
  selectedPosition,
  onPositionChange
}) => {
  const positions: { value: GamePosition; label: string }[] = [
    { value: 'top', label: 'Haut' },
    { value: 'center', label: 'Centre' },
    { value: 'bottom', label: 'Bas' },
    { value: 'left', label: 'Gauche' },
    { value: 'right', label: 'Droite' }
  ];

  return (
    <div className="space-y-2">
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
              ? 'bg-[#841b60] text-white border-[#841b60]'
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
              ? 'bg-[#841b60] text-white border-[#841b60]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#841b60]'
          }`}
        >
          Gauche
        </button>
        <button
          onClick={() => onPositionChange('center')}
          className={`p-2 text-xs rounded border transition-colors ${
            selectedPosition === 'center'
              ? 'bg-[#841b60] text-white border-[#841b60]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#841b60]'
          }`}
        >
          Centre
        </button>
        <button
          onClick={() => onPositionChange('right')}
          className={`p-2 text-xs rounded border transition-colors ${
            selectedPosition === 'right'
              ? 'bg-[#841b60] text-white border-[#841b60]'
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
              ? 'bg-[#841b60] text-white border-[#841b60]'
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

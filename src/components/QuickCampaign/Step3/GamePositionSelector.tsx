
import React from 'react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const GamePositionSelector: React.FC = () => {
  const { gamePosition, setGamePosition } = useQuickCampaignStore();

  const positions = [
    { value: 'top', label: 'Haut', icon: '⬆️' },
    { value: 'center', label: 'Centre', icon: '⚫' },
    { value: 'bottom', label: 'Bas', icon: '⬇️' },
    { value: 'left', label: 'Gauche', icon: '⬅️' },
    { value: 'right', label: 'Droite', icon: '➡️' }
  ];

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Position du jeu</h3>
      <div className="grid grid-cols-3 gap-3">
        {positions.map((position) => (
          <button
            key={position.value}
            onClick={() => setGamePosition(position.value as any)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
              gamePosition === position.value
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500 text-blue-700 shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl mb-1">{position.icon}</span>
            <span className="text-sm font-medium">{position.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default GamePositionSelector;

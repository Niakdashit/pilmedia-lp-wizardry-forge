import React from 'react';

interface GameTabProps {
  reelSymbols: string[];
  spinDuration: number;
  winProbability: number;
  onReelSymbolsChange?: (symbols: string[]) => void;
  onSpinDurationChange?: (duration: number) => void;
  onWinProbabilityChange?: (probability: number) => void;
}

const GameTab: React.FC<GameTabProps> = ({
  reelSymbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍒'],
  spinDuration = 1500,
  winProbability = 15,
  onReelSymbolsChange,
  onSpinDurationChange,
  onWinProbabilityChange
}) => {
  const handleSymbolChange = (index: number, value: string) => {
    if (onReelSymbolsChange) {
      const newSymbols = [...reelSymbols];
      newSymbols[index] = value;
      onReelSymbolsChange(newSymbols);
    }
  };

  return (
    <div className="space-y-6">
      {/* Symboles des rouleaux */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Symboles des rouleaux</h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {reelSymbols.map((symbol, index) => (
            <input
              key={index}
              type="text"
              value={symbol}
              onChange={(e) => handleSymbolChange(index, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-center text-xl"
              maxLength={2}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">Modifiez les symboles en les éditant directement</p>
      </div>

      {/* Durée de rotation */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="spinDuration" className="text-sm font-medium text-gray-900">
            Durée de rotation (ms)
          </label>
          <span className="text-sm text-gray-700">{spinDuration}ms</span>
        </div>
        <input
          type="range"
          id="spinDuration"
          min="500"
          max="3000"
          step="100"
          value={spinDuration}
          onChange={(e) => onSpinDurationChange?.(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Probabilité de gain */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="winProbability" className="text-sm font-medium text-gray-900">
            Probabilité de gain
          </label>
          <span className="text-sm text-gray-700">{winProbability}%</span>
        </div>
        <input
          type="range"
          id="winProbability"
          min="1"
          max="100"
          value={winProbability}
          onChange={(e) => onWinProbabilityChange?.(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default GameTab;

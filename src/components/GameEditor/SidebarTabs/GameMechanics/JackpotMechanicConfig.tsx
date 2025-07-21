import React from 'react';
import BorderStyleSelector from '../../../SmartWheel/components/BorderStyleSelector';
import type { EditorConfig } from '../../GameEditorLayout';

interface JackpotMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const JackpotMechanicConfig: React.FC<JackpotMechanicConfigProps> = ({ config, onConfigUpdate }) => {
  const jackpotSymbols = config.jackpotSymbols || ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
  const winningCombination = config.jackpotWinningCombination || ['🍒', '🍒', '🍒'];

  const updateSymbols = (newSymbols: string[]) => {
    onConfigUpdate({ jackpotSymbols: newSymbols });
  };

  const updateSymbol = (index: number, symbol: string) => {
    const newSymbols = [...jackpotSymbols];
    newSymbols[index] = symbol;
    updateSymbols(newSymbols);
  };

  const updateWinningCombination = (index: number, symbol: string) => {
    const newCombination = [...winningCombination];
    newCombination[index] = symbol;
    onConfigUpdate({ jackpotWinningCombination: newCombination });
  };

  return (
    <div className="space-y-6">
      {/* Jackpot Border Style */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Style des bordures</h4>
        <div className="p-4 rounded-xl bg-sidebar-bg">
          <BorderStyleSelector
            currentStyle={config.jackpotBorderStyle || 'classic'}
            onStyleChange={(style) => onConfigUpdate({ jackpotBorderStyle: style })}
          />
        </div>
      </div>

      {/* Jackpot Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du jackpot</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de fond</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.jackpotBackgroundColor || '#1a1a2e'}
                onChange={(e) => onConfigUpdate({ jackpotBackgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={config.jackpotBackgroundColor || '#1a1a2e'}
                onChange={(e) => onConfigUpdate({ jackpotBackgroundColor: e.target.value })}
                placeholder="#1a1a2e"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Symbols */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Symboles disponibles</h4>
        
        <div className="grid grid-cols-3 gap-3">
          {jackpotSymbols.map((symbol, index) => (
            <div key={index} className="form-group-premium">
              <label className="text-xs">Symbole {index + 1}</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => updateSymbol(index, e.target.value)}
                className="w-full text-center text-lg"
                maxLength={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Winning Combination */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Combinaison gagnante</h4>
        
        <div className="grid grid-cols-3 gap-3">
          {winningCombination.map((symbol, index) => (
            <div key={index} className="form-group-premium">
              <label className="text-xs">Position {index + 1}</label>
              <select
                value={symbol}
                onChange={(e) => updateWinningCombination(index, e.target.value)}
                className="w-full text-center text-lg"
              >
                {jackpotSymbols.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JackpotMechanicConfig;
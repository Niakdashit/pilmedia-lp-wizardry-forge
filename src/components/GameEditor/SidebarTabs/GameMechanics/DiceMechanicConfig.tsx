import React from 'react';
import type { EditorConfig } from '../../GameEditorLayout';

interface DiceMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DiceMechanicConfig: React.FC<DiceMechanicConfigProps> = ({ config, onConfigUpdate }) => {
  const diceSides = config.diceSides || 6;
  const winningNumbers = config.diceWinningNumbers || [6];

  const updateWinningNumbers = (numbers: number[]) => {
    onConfigUpdate({ diceWinningNumbers: numbers });
  };

  const toggleWinningNumber = (number: number) => {
    if (winningNumbers.includes(number)) {
      updateWinningNumbers(winningNumbers.filter(n => n !== number));
    } else {
      updateWinningNumbers([...winningNumbers, number]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dice Settings */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du dé</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Nombre de faces</label>
            <select
              value={diceSides}
              onChange={(e) => onConfigUpdate({ diceSides: parseInt(e.target.value) })}
              className="w-full"
            >
              <option value={4}>4 faces</option>
              <option value={6}>6 faces</option>
              <option value={8}>8 faces</option>
              <option value={10}>10 faces</option>
              <option value={12}>12 faces</option>
              <option value={20}>20 faces</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Couleur du dé</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.diceColor || '#ffffff'}
                onChange={(e) => onConfigUpdate({ diceColor: e.target.value })}
              />
              <input
                type="text"
                value={config.diceColor || '#ffffff'}
                onChange={(e) => onConfigUpdate({ diceColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Couleur des points</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.diceDotColor || '#000000'}
                onChange={(e) => onConfigUpdate({ diceDotColor: e.target.value })}
              />
              <input
                type="text"
                value={config.diceDotColor || '#000000'}
                onChange={(e) => onConfigUpdate({ diceDotColor: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Winning Numbers */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Numéros gagnants</h4>
        
        <p className="text-sm text-sidebar-text-muted mb-4">
          Sélectionnez les numéros qui feront gagner le joueur
        </p>

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: diceSides }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => toggleWinningNumber(number)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                winningNumbers.includes(number)
                  ? 'bg-sidebar-active text-white border-sidebar-active'
                  : 'bg-sidebar-surface text-sidebar-text border-sidebar-border hover:border-sidebar-active'
              }`}
            >
              {number}
            </button>
          ))}
        </div>

        {winningNumbers.length === 0 && (
          <p className="text-sm text-orange-500 mt-2">
            ⚠️ Vous devez sélectionner au moins un numéro gagnant
          </p>
        )}
      </div>
    </div>
  );
};

export default DiceMechanicConfig;
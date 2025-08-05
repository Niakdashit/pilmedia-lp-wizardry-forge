import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface DiceInstantWinConfig {
  mode: 'instant_winner';
  winProbability: number; // entre 0 et 1 (ex: 0.2 pour 20%)
  maxWinners?: number;
  winnersCount?: number;
}

interface DiceProps {
  config?: any;
  onConfigChange: (config: any) => void;
  isPreview?: boolean;
  onComplete?: () => void;
  instantWinConfig?: DiceInstantWinConfig;
  onFinish?: (result: 'win' | 'lose') => void;
}

const Dice: React.FC<DiceProps> = ({
  config = {},
  onConfigChange,
  isPreview,
  onComplete,
  instantWinConfig,
  onFinish
}) => {
  const [diceValues, setDiceValues] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [isWin, setIsWin] = useState<boolean | null>(null);

  const rollDice = () => {
    if (isRolling || hasResult) return;

    setIsRolling(true);
    const interval = setInterval(() => {
      const newValues = Array.from(
        { length: config?.diceCount || 2 },
        () => Math.floor(Math.random() * 6) + 1
      );
      setDiceValues(newValues);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsRolling(false);

      const finalValues = Array.from(
        { length: config?.diceCount || 2 },
        () => Math.floor(Math.random() * 6) + 1
      );
      setDiceValues(finalValues);

      // Calcule la somme des dés
      const sum = finalValues.reduce((a, b) => a + b, 0);
      let win: boolean;

      // -------- INSTANT WIN LOGIC --------
      if (
        instantWinConfig &&
        instantWinConfig.mode === 'instant_winner' &&
        (!instantWinConfig.maxWinners || (instantWinConfig.winnersCount ?? 0) < instantWinConfig.maxWinners)
      ) {
        // Probabilité + Max winners
        win = Math.random() < (instantWinConfig.winProbability ?? 0.2);
      } else {
        // Logique classique (si pas d'instant gagnant)
        win = config?.winningConditions?.includes(sum) || sum === 7;
      }

      setHasResult(true);
      setIsWin(win);

      if (win) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onComplete?.();
        onFinish?.('win');
      } else {
        onFinish?.('lose');
      }
    }, 2000);
  };

  // Éditeur : Configuration des dés et des conditions
  if (!isPreview) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de dés
          </label>
          <input
            type="number"
            min="1"
            max="4"
            value={config?.diceCount || 2}
            onChange={(e) => onConfigChange({ ...config, diceCount: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Combinaisons gagnantes
          </label>
          <input
            type="text"
            value={config?.winningConditions?.join(', ') || '7, 11'}
            onChange={(e) => onConfigChange({
              ...config,
              winningConditions: e.target.value.split(',').map(n => parseInt(n.trim()))
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
            placeholder="7, 11"
          />
          <p className="mt-1 text-sm text-gray-500">
            Séparez les sommes gagnantes par des virgules
          </p>
        </div>
      </div>
    );
  }

  // Preview : Affichage et gameplay
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex flex-wrap justify-center gap-8">
        {(diceValues.length ? diceValues : [1, 1]).map((value, index) => (
          <motion.div
            key={index}
            className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl font-bold border-2 border-[#841b60] text-[#841b60]"
            animate={{
              rotate: isRolling ? [0, 360] : 0,
              scale: isRolling ? [1, 0.8, 1] : 1
            }}
            transition={{
              duration: 0.3,
              repeat: isRolling ? Infinity : 0
            }}
          >
            {value}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        {hasResult ? (
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${isWin ? 'text-green-600' : 'text-red-600'}`}>
              {isWin ? 'Félicitations, vous avez gagné !' : 'Dommage, retentez votre chance !'}
            </h2>
            {/* On peut proposer de rejouer ou d'afficher autre chose ici */}
          </div>
        ) : (
          <button
            onClick={rollDice}
            disabled={isRolling}
            className="px-8 py-3 bg-[#841b60] text-white font-medium rounded-xl hover:bg-[#6d164f] transition-colors duration-200 disabled:opacity-50"
          >
            {isRolling ? 'Lancement...' : 'Lancer les dés'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Dice;

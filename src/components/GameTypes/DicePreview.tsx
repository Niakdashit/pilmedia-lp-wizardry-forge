
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DicePreviewProps {
  config?: any;
}

const DicePreview: React.FC<DicePreviewProps> = ({ config = {} }) => {
  const [diceValues, setDiceValues] = useState<number[]>([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [rollCount, setRollCount] = useState(0);

  // Align preview with main Dice component configuration
  const numberOfDice = config?.diceCount || 2;
  const winningCombinations = config?.winningConditions || [7, 11];

  const rollDice = () => {
    if (isRolling) return;

    setIsRolling(true);
    setResult(null);

    // Animate rolling for 1 second
    const rollInterval = setInterval(() => {
      setDiceValues(Array.from({ length: numberOfDice }, () => Math.floor(Math.random() * 6) + 1));
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValues = Array.from({ length: numberOfDice }, () => Math.floor(Math.random() * 6) + 1);
      setDiceValues(finalValues);
      setIsRolling(false);
      setRollCount(rollCount + 1);

      const sum = finalValues.reduce((a, b) => a + b, 0);
      const isWin = winningCombinations.includes(sum);
      setResult(isWin ? 'win' : 'lose');
    }, 1000);
  };

  const getDiceFace = (value: number): React.ReactElement[] => {
    const dots: React.ReactElement[] = [];
    const dotPositions: Record<number, [number, number][]> = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [75, 25], [25, 75], [75, 75]],
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
    };

    const positions = dotPositions[value] || [];
    positions.forEach((pos, i) => {
      dots.push(
        <circle
          key={i}
          cx={pos[0]}
          cy={pos[1]}
          r="8"
          fill="white"
        />
      );
    });

    return dots;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 text-center">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Jeu de Dés</h3>
        <div className="text-sm text-gray-600">
          <p>Combinaisons gagnantes: {winningCombinations.join(', ')}</p>
          <p>Lancers: {rollCount}</p>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {diceValues.slice(0, numberOfDice).map((value, index) => (
          <motion.div
            key={index}
            className="relative"
            animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
            transition={{ 
              duration: isRolling ? 0.1 : 0.5,
              repeat: isRolling ? Infinity : 0,
              ease: "linear"
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="drop-shadow-lg"
            >
              <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="15"
                fill="#841b60"
                stroke="#6d1650"
                strokeWidth="2"
              />
              {getDiceFace(value)}
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-700 mb-2">
          Total: {diceValues.slice(0, numberOfDice).reduce((a, b) => a + b, 0)}
        </div>
        
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-lg ${
              result === 'win' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            <div className="text-2xl mb-1">
              {result === 'win' ? '🎉' : '😔'}
            </div>
            <p className="font-bold">
              {result === 'win' 
                ? config?.winMessage || 'Vous avez gagné !' 
                : config?.loseMessage || 'Dommage, réessayez !'}
            </p>
          </motion.div>
        )}
      </div>

      <button
        onClick={rollDice}
        disabled={isRolling}
        className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
          isRolling
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#841b60] hover:bg-[#6d1650] transform hover:scale-105'
        }`}
      >
        {isRolling ? 'Lancement...' : 'Lancer les dés'}
      </button>
    </div>
  );
};

export default DicePreview;


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
    <div className="dice-preview-container">
      <div className="dice-header">
        <h3 className="dice-title">Jeu de Dés</h3>
        <div className="dice-info">
          <p>Combinaisons gagnantes: {winningCombinations.join(', ')}</p>
          <p>Lancers: {rollCount}</p>
        </div>
      </div>

      <div className="dice-grid">
        {diceValues.slice(0, numberOfDice).map((value, index) => (
          <motion.div
            key={index}
            className="dice-wrapper"
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
              className="dice-svg"
            >
              <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="15"
                fill="hsl(var(--brand-primary))"
                stroke="hsl(var(--brand-primary) / 0.8)"
                strokeWidth="2"
              />
              {getDiceFace(value)}
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="dice-results">
        <div className="dice-total">
          Total: {diceValues.slice(0, numberOfDice).reduce((a, b) => a + b, 0)}
        </div>
        
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`dice-result ${result === 'win' ? 'dice-result-win' : 'dice-result-lose'}`}
          >
            <div className="dice-result-icon">
              {result === 'win' ? '🎉' : '😔'}
            </div>
            <p className="dice-result-text">
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
        className={`dice-button ${isRolling ? 'dice-button-disabled' : ''}`}
      >
        {isRolling ? 'Lancement...' : 'Lancer les dés'}
      </button>
    </div>
  );
};

export default DicePreview;

import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface JackpotGameProps {
  // Personnalisation des couleurs
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  slotBackgroundColor?: string;
  
  // Configuration du jeu
  symbols?: string[];
  winProbability?: number;
  rollDuration?: number;
  
  // Style et apparence
  borderRadius?: number;
  slotSize?: number;
  containerPadding?: number;
  
  // Callbacks
  onWin?: () => void;
  onLose?: () => void;
  onGameStart?: () => void;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '🍀'];

const JackpotGame: React.FC<JackpotGameProps> = ({
  primaryColor = '#ec4899',
  secondaryColor = '#8b5cf6',
  backgroundColor = '#1f2937',
  slotBackgroundColor = '#ffffff',
  symbols = DEFAULT_SYMBOLS,
  winProbability = 0.15,
  rollDuration = 2000,
  borderRadius = 16,
  slotSize = 80,
  containerPadding = 20,
  onWin,
  onLose,
  onGameStart
}) => {
  const [slots, setSlots] = useState<string[]>([
    symbols[0], symbols[1], symbols[2]
  ]);
  const [isRolling, setIsRolling] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  const rollSlots = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    setGameResult(null);
    setHasPlayed(true);
    onGameStart?.();

    // Animation de roulement
    const rollInterval = setInterval(() => {
      setSlots([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
    }, 100);

    // Arrêter après la durée spécifiée
    setTimeout(() => {
      clearInterval(rollInterval);
      
      // Déterminer le résultat
      const shouldWin = Math.random() < winProbability;
      
      let finalSlots: string[];
      if (shouldWin) {
        // Forcer une combinaison gagnante
        const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        finalSlots = [winSymbol, winSymbol, winSymbol];
        setGameResult('win');
        
        // Effet confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        onWin?.();
      } else {
        // Combinaison perdante
        finalSlots = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];
        // S'assurer que ce n'est pas une combinaison gagnante par accident
        while (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
          finalSlots[1] = symbols[Math.floor(Math.random() * symbols.length)];
        }
        setGameResult('lose');
        onLose?.();
      }
      
      setSlots(finalSlots);
      setIsRolling(false);
    }, rollDuration);
  }, [isRolling, symbols, winProbability, rollDuration, onWin, onLose, onGameStart]);

  const resetGame = useCallback(() => {
    setGameResult(null);
    setHasPlayed(false);
    setSlots([symbols[0], symbols[1], symbols[2]]);
  }, [symbols]);

  // Styles calculés
  const containerStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}dd)`,
    borderRadius: `${borderRadius}px`,
    padding: `${containerPadding}px`,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    border: `2px solid ${primaryColor}40`,
  };

  const slotsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: `linear-gradient(145deg, ${slotBackgroundColor}20, ${slotBackgroundColor}10)`,
    borderRadius: `${borderRadius - 4}px`,
    boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.2)',
  };

  const slotStyle: React.CSSProperties = {
    width: `${slotSize}px`,
    height: `${slotSize}px`,
    backgroundColor: slotBackgroundColor,
    borderRadius: `${borderRadius / 2}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${slotSize * 0.5}px`,
    fontWeight: 'bold',
    boxShadow: isRolling 
      ? '0 0 20px rgba(255, 255, 255, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.1)'
      : '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    transform: isRolling ? 'scale(1.05)' : 'scale(1)',
  };

  const buttonStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
    color: 'white',
    border: 'none',
    borderRadius: `${borderRadius / 2}px`,
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: isRolling ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    opacity: isRolling ? 0.7 : 1,
    transform: isRolling ? 'scale(0.95)' : 'scale(1)',
  };

  const resultStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '16px',
    color: gameResult === 'win' ? '#10b981' : gameResult === 'lose' ? '#ef4444' : 'transparent',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
      <div style={containerStyle}>
        {/* Slots */}
        <div style={slotsContainerStyle}>
          {slots.map((symbol, index) => (
            <div
              key={index}
              style={slotStyle}
              className={isRolling ? 'animate-pulse' : ''}
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Bouton de jeu */}
        <div className="flex flex-col items-center mt-6">
          <button
            onClick={rollSlots}
            disabled={isRolling}
            style={buttonStyle}
            onMouseEnter={(e) => {
              if (!isRolling) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRolling) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }
            }}
          >
            {isRolling ? 'Roulement...' : hasPlayed ? 'Rejouer' : 'Lancer le Jackpot'}
          </button>

          {/* Résultat */}
          <div style={resultStyle}>
            {gameResult === 'win' && '🎉 JACKPOT! Vous avez gagné! 🎉'}
            {gameResult === 'lose' && '😔 Pas de chance... Réessayez!'}
          </div>

          {/* Bouton reset (visible seulement après avoir joué) */}
          {hasPlayed && !isRolling && (
            <button
              onClick={resetGame}
              className="mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Recommencer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JackpotGame;

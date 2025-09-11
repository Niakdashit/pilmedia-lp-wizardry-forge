import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface JackpotGameProps {
  // Configuration des couleurs
  containerColor?: string;
  slotBackgroundColor?: string;
  slotBorderColor?: string;
  buttonColor?: string;
  
  // Configuration des bordures
  borderStyle?: 'classic' | 'neon' | 'metallic' | 'luxury';
  borderWidth?: number;
  
  // Configuration du jeu
  symbols?: string[];
  winProbability?: number;
  
  // Image de fond
  backgroundImage?: string;
  
  // Callbacks
  onWin?: () => void;
  onLose?: () => void;
  
  // Mode preview
  isPreview?: boolean;
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '⭐', '🎰'];

const JackpotGame: React.FC<JackpotGameProps> = ({
  containerColor = '#1f2937',
  slotBackgroundColor = '#ffffff',
  slotBorderColor = '#e5e7eb',
  buttonColor = '#ec4899',
  borderStyle = 'classic',
  borderWidth = 3,
  symbols = DEFAULT_SYMBOLS,
  winProbability = 0.3,
  backgroundImage,
  onWin,
  onLose,
  isPreview = true
}) => {
  const [slots, setSlots] = useState<string[]>(['🍒', '🍋', '🍊']);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const getBorderStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderWidth: `${borderWidth}px`,
      borderStyle: 'solid',
    };

    switch (borderStyle) {
      case 'neon':
        baseStyles.borderColor = '#00ffff';
        baseStyles.boxShadow = `
          0 0 20px #00ffff60, 
          0 0 40px #00ffff40, 
          inset 0 2px 4px rgba(255, 255, 255, 0.1)
        `;
        break;
      case 'metallic':
        baseStyles.borderColor = '#c0c0c0';
        baseStyles.background = `linear-gradient(135deg, #e6e6e6, #b3b3b3, #cccccc)`;
        baseStyles.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        break;
      case 'luxury':
        baseStyles.borderColor = '#ffd700';
        baseStyles.background = `linear-gradient(135deg, #ffd700, #ffed4e, #fbbf24)`;
        baseStyles.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.4)';
        break;
      default: // classic
        baseStyles.borderColor = slotBorderColor;
        baseStyles.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    }

    return baseStyles;
  };

  const rollSlots = () => {
    if (isRolling || !isPreview) return;

    setIsRolling(true);
    setResult(null);

    // Animation de roulement
    const rollInterval = setInterval(() => {
      setSlots([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
    }, 100);

    // Arrêter après 2 secondes et déterminer le résultat
    setTimeout(() => {
      clearInterval(rollInterval);
      
      const isWin = Math.random() < winProbability;
      
      if (isWin) {
        // Forcer 3 symboles identiques pour une victoire
        const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        setSlots([winSymbol, winSymbol, winSymbol]);
        setResult('win');
        
        // Animation confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        onWin?.();
      } else {
        // S'assurer que les symboles ne sont pas tous identiques
        const finalSlots = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];
        
        // Vérifier qu'ils ne sont pas tous identiques
        while (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
          finalSlots[2] = symbols[Math.floor(Math.random() * symbols.length)];
        }
        
        setSlots(finalSlots);
        setResult('lose');
        onLose?.();
      }
      
      setIsRolling(false);
    }, 2000);
  };

  const resetGame = () => {
    setResult(null);
    setSlots(['🍒', '🍋', '🍊']);
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: containerColor,
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    minWidth: '300px',
    position: 'relative',
    ...getBorderStyles(),
  };

  if (backgroundImage) {
    containerStyle.backgroundImage = `
      linear-gradient(145deg, ${containerColor}cc, ${containerColor}aa),
      url(${backgroundImage})
    `;
    containerStyle.backgroundSize = 'cover';
    containerStyle.backgroundPosition = 'center';
  }

  const slotStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    backgroundColor: slotBackgroundColor,
    border: `2px solid ${slotBorderColor}`,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.1s ease',
    transform: isRolling ? 'scale(1.05)' : 'scale(1)',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: buttonColor,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isRolling ? 'not-allowed' : 'pointer',
    opacity: isRolling ? 0.7 : 1,
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  };

  return (
    <div style={containerStyle}>
      {/* Titre */}
      <h2 style={{ 
        color: 'white', 
        margin: 0, 
        fontSize: '24px', 
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
      }}>
        🎰 Jackpot
      </h2>

      {/* Slots */}
      <div style={{ 
        display: 'flex', 
        gap: '16px',
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        {slots.map((symbol, index) => (
          <div key={index} style={slotStyle}>
            {symbol}
          </div>
        ))}
      </div>

      {/* Résultat */}
      {result && (
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: result === 'win' ? '#10b981' : '#ef4444',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {result === 'win' ? '🎉 Félicitations ! Vous avez gagné !' : '😔 Dommage, essayez encore !'}
        </div>
      )}

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={rollSlots}
          disabled={isRolling}
          style={buttonStyle}
        >
          {isRolling ? '🎰 En cours...' : '🎰 Lancer'}
        </button>
        
        {result && (
          <button
            onClick={resetGame}
            style={{
              ...buttonStyle,
              backgroundColor: '#6b7280',
            }}
          >
            🔄 Rejouer
          </button>
        )}
      </div>

      {/* Probabilité de gain (en mode développement) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          Win: {Math.round(winProbability * 100)}%
        </div>
      )}
    </div>
  );
};

export default JackpotGame;

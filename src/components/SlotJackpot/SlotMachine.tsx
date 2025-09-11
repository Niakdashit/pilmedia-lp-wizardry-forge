import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SlotMachineProps {
  onWin?: (result: string[]) => void;
  onLose?: () => void;
  disabled?: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onWin, onLose, disabled = false }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinDuration, setSpinDuration] = useState([0, 0, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];

  const spin = useCallback(() => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    
    // Durées différentes pour chaque rouleau (effet cascade)
    const durations = [1500, 2000, 2500];
    setSpinDuration(durations);

    // Animation des rouleaux
    durations.forEach((duration, index) => {
      setTimeout(() => {
        const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        setReels(prev => {
          const newReels = [...prev];
          newReels[index] = finalSymbol;
          return newReels;
        });
      }, duration);
    });

    // Vérifier le résultat après que tous les rouleaux se soient arrêtés
    setTimeout(() => {
      setIsSpinning(false);
      
      // Logique de gain simple
      const finalReels = reels.map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      setReels(finalReels);
      
      const isWinning = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2];
      
      if (isWinning) {
        onWin?.(finalReels);
      } else {
        onLose?.();
      }
    }, Math.max(...durations) + 100);
  }, [isSpinning, disabled, symbols, reels, onWin, onLose]);

  // Calcul responsive de la taille
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const maxWidth = Math.min(rect.width * 0.8, 400);
      const maxHeight = Math.min(rect.height * 0.6, 300);
      
      containerRef.current.style.setProperty('--slot-w', `${maxWidth}px`);
      containerRef.current.style.setProperty('--slot-h', `${maxHeight}px`);
    };

    updateSize();
    
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="slot-root"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'auto',
        background: 'transparent'
      }}
    >
      <div 
        className="slot-machine"
        style={{
          width: 'var(--slot-w, 300px)',
          height: 'var(--slot-h, 200px)',
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}
      >
        {/* Rouleaux */}
        <div 
          className="slot-reels"
          style={{
            display: 'flex',
            gap: '10px',
            background: '#000',
            padding: '15px',
            borderRadius: '10px',
            border: '3px solid #ffd700'
          }}
        >
          {reels.map((symbol, index) => (
            <div
              key={index}
              className={`slot-reel ${isSpinning ? 'slot-spinning' : ''}`}
              style={{
                width: '60px',
                height: '60px',
                background: '#fff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                border: '2px solid #333',
                animation: isSpinning ? `slot-spin-${index} ${spinDuration[index]}ms ease-out` : 'none'
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Bouton Spin */}
        <button
          onClick={spin}
          disabled={isSpinning || disabled}
          className="slot-spin-button"
          style={{
            background: isSpinning || disabled 
              ? 'linear-gradient(145deg, #666, #444)' 
              : 'linear-gradient(145deg, #ff6b6b, #ee5a24)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: isSpinning || disabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            transform: isSpinning ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN'}
        </button>
      </div>

      <style>{`
        @keyframes slot-spin-0 {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(1800deg); }
        }
        @keyframes slot-spin-1 {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(2160deg); }
        }
        @keyframes slot-spin-2 {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(2520deg); }
        }
        
        .slot-spinning {
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }
        
        .slot-spin-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
};

export default SlotMachine;

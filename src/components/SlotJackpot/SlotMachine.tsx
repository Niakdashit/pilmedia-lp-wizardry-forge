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
          width: 'var(--slot-w, 400px)',
          height: 'var(--slot-h, 300px)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}
      >
        {/* Couronne */}
        <div 
          className="slot-crown"
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '60px',
            background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 35%, 85% 100%, 50% 70%, 15% 100%, 0% 35%)',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            zIndex: 10
          }}
        >
          {/* Gemmes sur la couronne */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            width: '8px',
            height: '8px',
            background: '#ff6b6b',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(255, 107, 107, 0.6)'
          }} />
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '10px',
            background: '#4ecdc4',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(78, 205, 196, 0.6)'
          }} />
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '8px',
            height: '8px',
            background: '#45b7d1',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(69, 183, 209, 0.6)'
          }} />
        </div>

        {/* Cadre principal avec bordure dorée */}
        <div 
          className="slot-frame"
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(145deg, #dc143c, #b91c3c)',
            borderRadius: '25px',
            border: '8px solid #ffd700',
            boxShadow: '0 15px 40px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.2)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '30px 20px 20px'
          }}
        >
          {/* Points décoratifs sur le cadre */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '12px',
                height: '12px',
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                top: i < 6 ? '15px' : 'auto',
                bottom: i >= 6 ? '15px' : 'auto',
                left: i < 6 ? `${20 + (i * 60)}px` : `${20 + ((i - 6) * 60)}px`,
                transform: 'translateX(-50%)'
              }}
            />
          ))}

          {/* Zone centrale dorée pour les rouleaux */}
          <div 
            className="slot-inner-frame"
            style={{
              background: 'linear-gradient(145deg, #ffed4e, #ffd700)',
              borderRadius: '15px',
              padding: '15px',
              border: '3px solid #b8860b',
              boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            {/* Rouleaux */}
            <div 
              className="slot-reels"
              style={{
                display: 'flex',
                gap: '8px'
              }}
            >
              {reels.map((symbol, index) => (
                <div
                  key={index}
                  className={`slot-reel ${isSpinning ? 'slot-spinning' : ''}`}
                  style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(145deg, #fff, #f0f0f0)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    border: '2px solid #b8860b',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.5)',
                    animation: isSpinning ? `slot-spin-${index} ${spinDuration[index]}ms ease-out` : 'none'
                  }}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>

          {/* Bouton Spin */}
          <button
            onClick={spin}
            disabled={isSpinning || disabled}
            className="slot-spin-button"
            style={{
              background: isSpinning || disabled 
                ? 'linear-gradient(145deg, #888, #666)' 
                : 'linear-gradient(145deg, #ffd700, #ffed4e)',
              color: isSpinning || disabled ? '#ccc' : '#8b4513',
              border: '3px solid #b8860b',
              borderRadius: '20px',
              padding: '10px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isSpinning || disabled ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              transform: isSpinning ? 'scale(0.95)' : 'scale(1)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>
        </div>
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

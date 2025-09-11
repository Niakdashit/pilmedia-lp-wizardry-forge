import React, { useState, useEffect, useRef } from 'react';
import './SlotJackpot.css';

interface SlotJackpotProps {
  onWin?: (prize: string) => void;
  onLose?: () => void;
}

const SlotJackpot: React.FC<SlotJackpotProps> = ({ onWin, onLose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['🍒', '🍋', '🍊']);
  const [canSpin, setCanSpin] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];
  
  // ResizeObserver pour contraindre la taille avec debounce
  useEffect(() => {
    if (!containerRef.current) return;
    
    let timeoutId: number;
    
    const observer = new ResizeObserver((entries) => {
      // Debounce pour éviter les boucles ResizeObserver
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          const maxSize = Math.min(width * 0.8, height * 0.8, 400);
          
          // Utiliser requestAnimationFrame pour éviter les conflits de layout
          requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--slot-w', `${maxSize}px`);
            document.documentElement.style.setProperty('--slot-h', `${maxSize * 0.8}px`);
          });
        }
      }, 16); // ~60fps debounce
    });
    
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const spin = () => {
    if (!canSpin || isSpinning) return;
    
    setIsSpinning(true);
    setCanSpin(false);
    
    // Animation des rouleaux
    const spinDuration = 2000 + Math.random() * 1000;
    
    setTimeout(() => {
      const newReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      setReels(newReels);
      setIsSpinning(false);
      
      // Vérifier si c'est gagnant
      const isWin = newReels[0] === newReels[1] && newReels[1] === newReels[2];
      
      setTimeout(() => {
        if (isWin) {
          onWin?.(newReels[0]);
        } else {
          onLose?.();
        }
        setCanSpin(true);
      }, 500);
      
    }, spinDuration);
  };

  return (
    <div ref={containerRef} className="slot-root">
      <div className="slot-machine">
        <div className="slot-header">
          <h2 className="slot-title">🎰 JACKPOT</h2>
        </div>
        
        <div className="slot-reels">
          {reels.map((symbol, index) => (
            <div 
              key={index} 
              className={`slot-reel ${isSpinning ? 'slot-spinning' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="slot-symbol">{symbol}</div>
            </div>
          ))}
        </div>
        
        <button 
          className={`slot-spin-btn ${!canSpin ? 'slot-disabled' : ''}`}
          onClick={spin}
          disabled={!canSpin}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN'}
        </button>
        
        <div className="slot-instructions">
          Alignez 3 symboles identiques pour gagner !
        </div>
      </div>
    </div>
  );
};

export default SlotJackpot;

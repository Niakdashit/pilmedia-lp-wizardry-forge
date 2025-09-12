import React, { useState, useCallback, useMemo } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import './SlotMachine.css';

interface SlotMachineProps {
  onWin?: (result: string[]) => void;
  onLose?: () => void;
  onOpenConfig?: () => void;
  disabled?: boolean;
  symbols?: string[]; // Optionnel: permet d'injecter des symboles
}

const DEFAULT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'];

const SlotMachine: React.FC<SlotMachineProps> = ({ onWin, onLose, onOpenConfig, disabled = false, symbols: propSymbols }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const campaign = useEditorStore?.((s: any) => s.campaign);
  const campaignSymbols = campaign?.gameConfig?.slot?.symbols as string[] | undefined;
  const jackpotConfig = campaign?.gameConfig?.jackpot || {};
  const symbols = useMemo(() => propSymbols ?? campaignSymbols ?? DEFAULT_SYMBOLS, [propSymbols, campaignSymbols]);
  const [reels, setReels] = useState([symbols[0], symbols[0], symbols[0]]);

  const spin = useCallback(() => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    
    // Durées différentes pour chaque rouleau (effet cascade)
    const durations = [1500, 2000, 2500];

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

  return (
    <div 
      className="slot-root"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          backgroundColor: jackpotConfig.containerBackgroundColor || 'transparent'
        }}
    >
      <div 
        className="slot-machine"
        onClick={() => {
          // Déclencher l'ouverture du panel de configuration
          onOpenConfig?.();
        }}
        style={{
          width: '400px',
          height: '300px',
          position: 'relative',
          backgroundImage: 'url(/assets/slot-frames/jackpot-frame.svg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        {/* Zone centrale pour les rouleaux */}
        <div 
          className="slot-machine-container"
          onClick={() => {
            // Déclencher l'ouverture du panel de configuration
            onOpenConfig?.();
          }}
          style={{
            position: 'absolute',
            top: '65%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
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
                  width: '70px',
                  height: '70px',
                  background: jackpotConfig.slotBackgroundColor || 'linear-gradient(145deg, #fff, #f0f0f0)',
                  border: `${jackpotConfig.slotBorderWidth || 2}px solid ${jackpotConfig.slotBorderColor || '#ffd700'}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#333',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.5)',
                  animation: isSpinning ? `spin-reel-${index} 1500ms ease-out` : 'none'
                }}
              >
                {symbol.startsWith('data:image') || symbol.startsWith('http') ? (
                  <img src={symbol} alt={`symbol-${index}`} className="w-8 h-8 object-contain" />
                ) : (
                  symbol
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton SPIN - En dehors du template */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className="slot-spin-button"
        style={{
          background: isSpinning 
            ? 'linear-gradient(145deg, #999, #666)' 
            : (jackpotConfig.buttonColor || 'linear-gradient(145deg, #ffd700, #ffed4e)'),
          border: '3px solid #b8860b',
          borderRadius: '15px',
          padding: '12px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: isSpinning ? '#ccc' : '#8b4513',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
          boxShadow: isSpinning 
            ? 'inset 0 4px 8px rgba(0,0,0,0.3)' 
            : '0 6px 20px rgba(255, 215, 0, 0.4), inset 0 2px 5px rgba(255,255,255,0.3)',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
          minWidth: '120px',
          transform: isSpinning ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        {isSpinning ? (jackpotConfig.buttonLabel ? 'SPINNING...' : 'SPINNING...') : (jackpotConfig.buttonLabel || 'SPIN')}
      </button>
    </div>
  );
};

export default SlotMachine;

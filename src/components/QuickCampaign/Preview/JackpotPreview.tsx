import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
interface JackpotPreviewProps {
  customColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  jackpotColors: {
    containerBackgroundColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    slotBorderColor: string;
    slotBorderWidth: number;
    slotBackgroundColor: string;
  };
}
const SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎', '🎰', '🔔', '🍀'];
const JackpotSlot: React.FC<{
  isRolling: boolean;
  finalSymbol: string;
  slotBorderColor: string;
  slotBorderWidth: number;
  slotBackgroundColor: string;
}> = ({
  isRolling,
  finalSymbol,
  slotBorderColor,
  slotBorderWidth,
  slotBackgroundColor
}) => {
  const [currentSymbol, setCurrentSymbol] = useState(finalSymbol);
  const [animationSymbols, setAnimationSymbols] = useState<string[]>([]);
  useEffect(() => {
    if (isRolling) {
      // Générer une série de symboles pour l'animation
      const symbols = Array.from({
        length: 20
      }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      symbols.push(finalSymbol); // Le symbole final à la fin
      setAnimationSymbols(symbols);
    } else {
      setCurrentSymbol(finalSymbol);
    }
  }, [isRolling, finalSymbol]);
  if (!isRolling) {
    return <div className="flex items-center justify-center flex-shrink-0" style={{
      width: 80,
      height: 80,
      borderRadius: 12,
      border: `${slotBorderWidth}px solid ${slotBorderColor}`,
      backgroundColor: slotBackgroundColor,
      fontSize: 32,
      fontWeight: 700,
      boxShadow: `
            0 6px 20px rgba(0, 0, 0, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 3px rgba(255, 255, 255, 0.2),
            inset 0 -1px 3px rgba(0, 0, 0, 0.1)
          `,
      background: `
            linear-gradient(145deg, 
              ${slotBackgroundColor}, 
              ${slotBackgroundColor}f0
            )
          `
    }}>
        {currentSymbol}
      </div>;
  }
  return <div className="relative flex-shrink-0 overflow-hidden" style={{
    width: 80,
    height: 80,
    borderRadius: 12,
    border: `${slotBorderWidth}px solid ${slotBorderColor}`,
    backgroundColor: slotBackgroundColor,
    boxShadow: `
          0 6px 20px rgba(0, 0, 0, 0.15),
          0 2px 8px rgba(0, 0, 0, 0.1),
          inset 0 1px 3px rgba(255, 255, 255, 0.2),
          inset 0 -1px 3px rgba(0, 0, 0, 0.1)
        `,
    background: `
          linear-gradient(145deg, 
            ${slotBackgroundColor}, 
            ${slotBackgroundColor}f0
          )
        `
  }}>
      <motion.div className="flex flex-col items-center justify-center" initial={{
      y: -1600
    }} animate={{
      y: 0
    }} transition={{
      duration: 2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}>
        {animationSymbols.map((symbol, index) => <div key={index} className="flex items-center justify-center" style={{
        width: 76,
        height: 76,
        fontSize: 32,
        fontWeight: 700
      }}>
            {symbol}
          </div>)}
      </motion.div>
    </div>;
};
const JackpotPreview: React.FC<JackpotPreviewProps> = ({
  customColors,
  jackpotColors
}) => {
  const [slots, setSlots] = useState<string[]>(['🍒', '🍋', '🍊']);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const roll = () => {
    if (isRolling || result) return;
    setIsRolling(true);
    setResult(null);

    // Définir les symboles finaux
    const finalSlots = [SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]];

    // Déterminer si c'est gagnant (30% de chance pour la démo)
    const isWin = Math.random() < 0.3;
    if (isWin) {
      // Si c'est gagnant, mettre le même symbole partout
      const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      finalSlots.fill(winSymbol);
    }
    setSlots(finalSlots);
    setTimeout(() => {
      setIsRolling(false);
      const win = finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2];
      setResult(win ? 'win' : 'lose');
      if (win) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: {
            y: 0.7
          }
        });
      }
    }, 2000);
  };
  const reset = () => {
    setResult(null);
    setSlots(['🍒', '🍋', '🍊']);
  };

  // Calculer la largeur nécessaire pour les 3 slots + gaps
  const slotsContainerWidth = 80 * 3 + 12 * 2;
  const slotsContainerStyle: React.CSSProperties = {
    width: slotsContainerWidth + jackpotColors.borderWidth * 2 + 24,
    height: 80 + jackpotColors.borderWidth * 2 + 24,
    border: `${jackpotColors.borderWidth}px solid ${jackpotColors.borderColor}`,
    borderRadius: '16px',
    backgroundColor: jackpotColors.containerBackgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    position: 'relative',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.1)
    `,
    background: `
      linear-gradient(145deg, 
        ${jackpotColors.containerBackgroundColor}, 
        ${jackpotColors.containerBackgroundColor}dd
      )
    `
  };
  const innerZoneStyle: React.CSSProperties = {
    backgroundColor: jackpotColors.backgroundColor + 'dd',
    borderRadius: '12px',
    padding: '8px',
    gap: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap' as const,
    boxShadow: `
      inset 0 3px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 4px rgba(0, 0, 0, 0.1),
      0 1px 2px rgba(255, 255, 255, 0.1)
    `
  };
  return <div className="flex flex-col items-center justify-center space-y-6 py-[12px]">
      <div className="text-center mb-4">
        
        
      </div>

      {/* Conteneur des slots avec effets 3D */}
      <div style={slotsContainerStyle}>
        <div style={innerZoneStyle}>
          {slots.map((symbol, i) => <JackpotSlot key={i} isRolling={isRolling} finalSymbol={symbol} slotBorderColor={jackpotColors.slotBorderColor} slotBorderWidth={jackpotColors.slotBorderWidth} slotBackgroundColor={jackpotColors.slotBackgroundColor} />)}
        </div>
      </div>

      {/* Résultat et contrôles */}
      <div className="flex flex-col items-center space-y-4 py-[20px]">
        {result && <div className={`text-lg font-bold ${result === 'win' ? 'text-green-600' : 'text-red-500'}`}>
            {result === 'win' ? '🎉 Jackpot ! 🎉' : '😞 Dommage, réessayez !'}
          </div>}
        
        <div className="flex space-x-3">
          <button onClick={roll} disabled={isRolling} className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50" style={{
          backgroundColor: customColors.primary,
          border: `3px solid ${jackpotColors.borderColor}`,
          borderRadius: '12px',
          boxShadow: `
                0 6px 20px rgba(0, 0, 0, 0.15),
                0 2px 8px rgba(0, 0, 0, 0.1),
                inset 0 1px 3px rgba(255, 255, 255, 0.2),
                inset 0 -1px 3px rgba(0, 0, 0, 0.1)
              `,
          background: `
                linear-gradient(145deg, 
                  ${customColors.primary}, 
                  ${customColors.primary}dd
                )
              `
        }}>
            {isRolling ? '🎰 Roulement...' : 'Lancer le Jackpot'}
          </button>
          
          {result && <button onClick={reset} className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Reset
            </button>}
        </div>
      </div>
    </div>;
};
export default JackpotPreview;
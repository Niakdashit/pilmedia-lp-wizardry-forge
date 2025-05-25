import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

// Paramètres slots
const SYMBOLS = ['🍒', '🍋', '🍊', '🍀', '7️⃣', '💎', '⭐'];
const SLOT_SIZE = 80; // px (desktop)
const SLOT_GAP = 16; // px

interface JackpotInstantWinConfig {
  mode: 'instant_winner';
  winProbability: number; // ex: 0.05
  maxWinners?: number;
  winnersCount?: number;
}
interface JackpotProps {
  isPreview?: boolean;
  instantWinConfig?: JackpotInstantWinConfig;
  onFinish?: (result: 'win' | 'lose') => void;
  buttonLabel?: string;
  buttonColor?: string;
}
const Jackpot: React.FC<JackpotProps> = ({
  isPreview,
  instantWinConfig,
  onFinish,
  buttonLabel = "Lancer le Jackpot",
  buttonColor = "#ec4899"
}) => {
  const [slots, setSlots] = useState<string[]>(['🍒', '🍋', '🍊']);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const roll = () => {
    if (isRolling || result) return;
    setIsRolling(true);
    let currentSlots = [...slots];
    const rollInterval = setInterval(() => {
      currentSlots = [SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]];
      setSlots([...currentSlots]);
    }, 100);
    setTimeout(() => {
      clearInterval(rollInterval);
      // Décide le résultat
      let win = false;
      if (instantWinConfig && instantWinConfig.mode === 'instant_winner' && (!instantWinConfig.maxWinners || (instantWinConfig.winnersCount ?? 0) < instantWinConfig.maxWinners)) {
        win = Math.random() < (instantWinConfig.winProbability ?? 0.1);
      } else {
        win = currentSlots[0] === currentSlots[1] && currentSlots[1] === currentSlots[2];
      }
      setIsRolling(false);
      setResult(win ? 'win' : 'lose');
      if (win) {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: {
            y: 0.7
          }
        });
        onFinish?.('win');
      } else {
        onFinish?.('lose');
      }
    }, 1800);
  };
  if (!isPreview) {
    return <div>
        <p>Pas de configuration pour le moment.</p>
      </div>;
  }

  // Simple container sans SVG par défaut
  return <div style={{
    maxWidth: 400,
    width: "95%",
    minHeight: 340
  }} className="flex flex-col items-center justify-center w-full h-full px-0">
      {/* Slots - centrés */}
      <div style={{
      display: "flex",
      gap: SLOT_GAP,
      background: "rgba(255,255,255,0.9)",
      padding: 12,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      marginBottom: 24
    }}>
        {slots.map((symbol, i) => <motion.div key={i} className="bg-white shadow-md flex items-center justify-center" style={{
        width: SLOT_SIZE,
        height: SLOT_SIZE,
        borderRadius: 10,
        border: "3px solid #fff",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.09)",
        fontSize: 38,
        fontWeight: 700
      }} animate={{
        scale: isRolling ? [1, 0.93, 1] : 1
      }} transition={{
        duration: 0.32,
        repeat: isRolling ? Infinity : 0
      }}>
            {symbol}
          </motion.div>)}
      </div>

      {/* Résultat ou Bouton */}
      <div className="flex flex-col items-center">
        {result ? <h2 className={`text-xl font-bold mb-4 ${result === "win" ? "text-green-600" : "text-red-600"}`}>
            {result === "win" ? "JACKPOT ! Vous avez gagné !" : "Dommage, pas de jackpot !"}
          </h2> : <button onClick={roll} disabled={isRolling} className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50" style={{
        backgroundColor: buttonColor,
        fontSize: 18
      }}>
            {isRolling ? "Roulement..." : buttonLabel}
          </button>}
      </div>
    </div>;
};
export default Jackpot;
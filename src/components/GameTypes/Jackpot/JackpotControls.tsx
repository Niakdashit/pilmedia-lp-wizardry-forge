
import React from "react";
import { GameResult } from "./types";

interface JackpotControlsProps {
  result: GameResult;
  isRolling: boolean;
  onRoll: () => void;
  buttonLabel: string;
  buttonColor: string;
  borderColor: string;
  disabled?: boolean;
}

const JackpotControls: React.FC<JackpotControlsProps> = ({
  result,
  isRolling,
  onRoll,
  buttonLabel,
  buttonColor,
  borderColor
}) => {
  if (result) {
    return (
      <h3 
        className={`text-lg font-bold mb-2 text-center ${result === "win" ? "text-green-400" : "text-red-400"}`} 
        style={{ 
          fontSize: 'clamp(16px, 4vw, 20px)',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}
      >
        {result === "win" ? "🎉 Vous avez gagné ! 🎉" : "😞 Dommage, réessayez !"}
      </h3>
    );
  }

  return (
    <button
      onClick={onRoll}
      disabled={isRolling || disabled}
      className="px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 max-w-full"
      style={{
        backgroundColor: buttonColor,
        fontSize: 'clamp(14px, 3.5vw, 18px)',
        minHeight: '48px',
        border: `3px solid ${borderColor}`,
        borderRadius: '12px',
        // Effets 3D pour le bouton
        boxShadow: `
          0 6px 20px rgba(0, 0, 0, 0.15),
          0 2px 8px rgba(0, 0, 0, 0.1),
          inset 0 1px 3px rgba(255, 255, 255, 0.2),
          inset 0 -1px 3px rgba(0, 0, 0, 0.1)
        `,
        background: `
          linear-gradient(145deg, 
            ${buttonColor}, 
            ${buttonColor}dd
          )
        `,
        transform: isRolling ? 'translateY(1px)' : 'translateY(0)',
        cursor: isRolling ? 'not-allowed' : 'pointer'
      }}
      onMouseDown={(e) => {
        if (!isRolling) {
          e.currentTarget.style.transform = 'translateY(2px)';
          e.currentTarget.style.boxShadow = `
            0 3px 10px rgba(0, 0, 0, 0.2),
            0 1px 4px rgba(0, 0, 0, 0.15),
            inset 0 1px 3px rgba(255, 255, 255, 0.2),
            inset 0 -1px 3px rgba(0, 0, 0, 0.1)
          `;
        }
      }}
      onMouseUp={(e) => {
        if (!isRolling) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `
            0 6px 20px rgba(0, 0, 0, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 3px rgba(255, 255, 255, 0.2),
            inset 0 -1px 3px rgba(0, 0, 0, 0.1)
          `;
        }
      }}
      onMouseLeave={(e) => {
        if (!isRolling) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `
            0 6px 20px rgba(0, 0, 0, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 3px rgba(255, 255, 255, 0.2),
            inset 0 -1px 3px rgba(0, 0, 0, 0.1)
          `;
        }
      }}
    >
      {isRolling ? "🎰 Roulement..." : buttonLabel}
    </button>
  );
};

export default JackpotControls;

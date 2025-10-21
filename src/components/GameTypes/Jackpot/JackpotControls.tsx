
import React from "react";
import { GameResult } from "./types";
import { getBorderStyle } from "../../SmartWheel/utils/borderStyles";

interface JackpotControlsProps {
  result: GameResult;
  isRolling: boolean;
  onRoll: () => void;
  buttonLabel: string;
  buttonColor: string;
  borderStyle: string;
  disabled?: boolean;
}

const JackpotControls: React.FC<JackpotControlsProps> = ({
  result,
  isRolling,
  onRoll,
  buttonLabel,
  buttonColor,
  borderStyle,
  disabled = false
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

  // Obtenir le style de bordure sélectionné
  const currentBorderStyle = getBorderStyle(borderStyle);

  // Créer les styles CSS pour les effets de bordure du bouton
  const getButtonBorderStyles = () => {
    const style = currentBorderStyle;
    const baseStyles: React.CSSProperties = {
      borderWidth: `${Math.max(2, style.width - 2)}px`, // Bordure un peu plus fine que le conteneur
      borderStyle: 'solid',
      borderRadius: '12px',
    };

    // Appliquer les couleurs selon le type
    switch (style.type) {
      case 'gradient':
        baseStyles.borderImage = `linear-gradient(45deg, ${style.colors.join(', ')}) 1`;
        break;
      case 'metallic':
      case 'luxury':
        baseStyles.borderColor = style.colors[0];
        // Ajouter un effet métallique subtil au bouton
        baseStyles.background = `linear-gradient(145deg, ${buttonColor}, ${buttonColor}dd), linear-gradient(135deg, ${style.colors.join(', ')})`;
        baseStyles.backgroundBlendMode = 'overlay, normal';
        break;
      case 'neon':
        baseStyles.borderColor = style.colors[0];
        if (style.effects.glow) {
          baseStyles.boxShadow = `
            0 0 15px ${style.colors[0]}40, 
            0 0 30px ${style.colors[0]}20,
            0 6px 20px rgba(0, 0, 0, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 3px rgba(255, 255, 255, 0.2),
            inset 0 -1px 3px rgba(0, 0, 0, 0.1)
          `;
        }
        break;
      default:
        baseStyles.borderColor = style.colors[0];
    }

    // Ajouter l'effet d'ombre si spécifié et si pas de lueur
    if (style.effects.shadow && !style.effects.glow) {
      baseStyles.boxShadow = `
        0 6px 20px rgba(0, 0, 0, 0.15),
        0 2px 8px rgba(0, 0, 0, 0.1),
        inset 0 1px 3px rgba(255, 255, 255, 0.2),
        inset 0 -1px 3px rgba(0, 0, 0, 0.1)
      `;
    }

    // Ajouter l'animation si spécifiée
    if (style.effects.animated && !isRolling) {
      baseStyles.animation = 'pulse 2s infinite';
    }

    return baseStyles;
  };

  return (
    <button
      onClick={onRoll}
      disabled={isRolling || disabled}
      className="px-6 py-3 text-white font-medium transition-all duration-200 disabled:opacity-50 max-w-full"
      style={{
        backgroundColor: buttonColor,
        fontSize: 'clamp(14px, 3.5vw, 18px)',
        minHeight: '48px',
        background: `linear-gradient(145deg, ${buttonColor}, ${buttonColor}dd)`,
        transform: isRolling ? 'translateY(1px)' : 'translateY(0)',
        cursor: (isRolling || disabled) ? 'not-allowed' : 'pointer',
        opacity: (disabled && !isRolling) ? 0.7 : 1,
        ...getButtonBorderStyles(),
      }}
      onMouseDown={(e) => {
        if (!isRolling && !disabled) {
          e.currentTarget.style.transform = 'translateY(2px)';
          // Réduire l'intensité des effets au clic
          if (currentBorderStyle.effects.glow) {
            e.currentTarget.style.boxShadow = `
              0 0 10px ${currentBorderStyle.colors[0]}30, 
              0 0 20px ${currentBorderStyle.colors[0]}15,
              0 3px 10px rgba(0, 0, 0, 0.2),
              0 1px 4px rgba(0, 0, 0, 0.15)
            `;
          } else {
            e.currentTarget.style.boxShadow = `
              0 3px 10px rgba(0, 0, 0, 0.2),
              0 1px 4px rgba(0, 0, 0, 0.15),
              inset 0 1px 3px rgba(255, 255, 255, 0.2),
              inset 0 -1px 3px rgba(0, 0, 0, 0.1)
            `;
          }
        }
      }}
      onMouseUp={(e) => {
        if (!isRolling && !disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          // Restaurer les effets originaux
          const originalStyles = getButtonBorderStyles();
          if (originalStyles.boxShadow) {
            e.currentTarget.style.boxShadow = originalStyles.boxShadow as string;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isRolling && !disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          // Restaurer les effets originaux
          const originalStyles = getButtonBorderStyles();
          if (originalStyles.boxShadow) {
            e.currentTarget.style.boxShadow = originalStyles.boxShadow as string;
          }
        }
      }}
    >
      {isRolling ? "🎰 Roulement..." : buttonLabel}
    </button>
  );
};

export default JackpotControls;

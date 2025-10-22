
import React, { useState } from "react";
import confetti from "canvas-confetti";
import JackpotSlot from "./JackpotSlot";
import JackpotControls from "./JackpotControls";
import { JackpotProps, GameResult } from "./types";
import { SYMBOLS, ROLL_INTERVAL_MS, ROLL_DURATION_MS } from "./constants";
import { getSlotSize, getSlotGap } from "./utils";
import { getBorderStyle } from "../../SmartWheel/utils/borderStyles";

const Jackpot: React.FC<JackpotProps> = ({
  isPreview,
  instantWinConfig,
  onFinish,
  onStart,
  disabled = false,
  buttonLabel = "Lancer le Jackpot",
  buttonColor = "#ec4899",
  backgroundImage,
  backgroundColor = "#f3f4f6",
  borderStyle = "classic",
  slotBorderColor = "#ffffff",
  slotBorderWidth = 2,
  slotBackgroundColor = "#ffffff",
  containerBackgroundColor = "#1f2937"
}) => {
  const [slots, setSlots] = useState<string[]>(['🍒', '🍋', '🍊']);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<GameResult>(null);



  const roll = () => {
    if (isRolling || result || disabled) return;
    
    onStart?.();
    
    setIsRolling(true);
    let currentSlots = [...slots];
    
    const rollInterval = setInterval(() => {
      currentSlots = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      setSlots([...currentSlots]);
    }, ROLL_INTERVAL_MS);
    
    setTimeout(() => {
      clearInterval(rollInterval);
      let win = false;
      
      if (instantWinConfig && instantWinConfig.mode === 'instant_winner' && 
          (!instantWinConfig.maxWinners || (instantWinConfig.winnersCount ?? 0) < instantWinConfig.maxWinners)) {
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
          origin: { y: 0.7 }
        });
      }
      
      onFinish?.(win ? 'win' : 'lose');
    }, ROLL_DURATION_MS);
  };

  if (!isPreview) {
    return <div><p>Pas de configuration pour le moment.</p></div>;
  }

  const slotSize = getSlotSize();
  const slotGap = getSlotGap(slotSize);

  // Calculer la largeur nécessaire pour les 3 slots + gaps
  const slotsContainerWidth = (slotSize * 3) + (slotGap * 2);

  // Obtenir le style de bordure sélectionné
  const currentBorderStyle = getBorderStyle(borderStyle);

  // Créer les styles CSS pour les effets de bordure
  const getBorderStyles = () => {
    const style = currentBorderStyle;
    const baseStyles: React.CSSProperties = {
      borderWidth: `${style.width}px`,
      borderStyle: 'solid',
    };

    // Appliquer les couleurs selon le type
    switch (style.type) {
      case 'gradient':
        baseStyles.borderImage = `linear-gradient(45deg, ${style.colors.join(', ')}) 1`;
        break;
      case 'metallic':
      case 'luxury':
        baseStyles.borderColor = style.colors[0];
        baseStyles.background = `linear-gradient(135deg, ${style.colors.join(', ')})`;
        break;
      case 'neon':
        baseStyles.borderColor = style.colors[0];
        if (style.effects.glow) {
          baseStyles.boxShadow = `0 0 20px ${style.colors[0]}60, 0 0 40px ${style.colors[0]}40, inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)`;
        }
        break;
      default:
        baseStyles.borderColor = style.colors[0];
    }

    // Ajouter l'effet d'ombre si spécifié
    if (style.effects.shadow && !style.effects.glow) {
      baseStyles.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)`;
    }

    // Ajouter l'animation si spécifiée
    if (style.effects.animated) {
      baseStyles.animation = 'pulse 2s infinite';
    }

    return baseStyles;
  };

  // Style pour le conteneur des slots avec effets 3D - utilisant les styles de bordure
  const slotsContainerStyle: React.CSSProperties = {
    width: slotsContainerWidth + (currentBorderStyle.width * 2) + 24,
    height: slotSize + (currentBorderStyle.width * 2) + 24,
    borderRadius: '16px',
    backgroundColor: containerBackgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    position: 'relative',
    ...getBorderStyles(),
  };

  // Ajouter l'image de fond si disponible
  if (backgroundImage) {
    slotsContainerStyle.backgroundImage = `
      linear-gradient(145deg, 
        ${containerBackgroundColor}cc, 
        ${containerBackgroundColor}aa
      ),
      url(${backgroundImage})
    `;
    slotsContainerStyle.backgroundSize = 'cover';
    slotsContainerStyle.backgroundPosition = 'center';
    slotsContainerStyle.backgroundRepeat = 'no-repeat';
  }

  // Style pour la zone interne des slots avec effet de profondeur - utilisant backgroundColor reçu en props
  const innerZoneStyle: React.CSSProperties = {
    backgroundColor: backgroundColor + 'dd',
    borderRadius: '12px',
    padding: '8px',
    gap: slotGap,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap' as const,
    // Effet creusé
    boxShadow: `
      inset 0 3px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 4px rgba(0, 0, 0, 0.1),
      0 1px 2px rgba(255, 255, 255, 0.1)
    `,
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {/* Conteneur des slots avec effets 3D */}
      <div style={slotsContainerStyle}>
        <div style={innerZoneStyle}>
          {slots.map((symbol, i) => 
            <JackpotSlot
              key={i}
              symbol={symbol}
              isRolling={isRolling}
              slotSize={slotSize}
              slotBorderColor={slotBorderColor}
              slotBorderWidth={slotBorderWidth}
              slotBackgroundColor={slotBackgroundColor}
            />
          )}
        </div>
      </div>

      {/* Bouton de contrôle séparé */}
      <div className="flex flex-col items-center">
        <JackpotControls
          result={result}
          isRolling={isRolling}
          onRoll={roll}
          buttonLabel={buttonLabel}
          buttonColor={buttonColor}
          borderStyle={borderStyle}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default Jackpot;

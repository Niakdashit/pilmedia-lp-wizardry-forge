
import React from 'react';

interface WheelPointerProps {
  canvasSize: number;
  shouldCropWheel: boolean;
  gamePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
  pointerSize: number;
}

const WheelPointer: React.FC<WheelPointerProps> = ({
  canvasSize,
  shouldCropWheel,
  gamePosition,
  pointerSize
}) => {
  // Calcul de la position horizontale du pointeur
  const getPointerLeft = () => {
    if (shouldCropWheel) {
      if (gamePosition === 'left') {
        // Pour position left : pointeur au centre de la partie visible (moitié droite)
        return canvasSize * 0.25 - (pointerSize * 1.3) / 2;
      } else if (gamePosition === 'right') {
        // Pour position right : pointeur au centre de la partie visible (moitié gauche)
        return -canvasSize * 0.25 - (pointerSize * 1.3) / 2;
      }
    }
    // Position normale : au centre de la roue complète
    return canvasSize / 2 - (pointerSize * 1.3) / 2;
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: getPointerLeft(),
        top: -pointerSize * 0.6, // Ajuster pour que le pointeur touche le bord de la roue
        width: pointerSize * 1.3,
        height: pointerSize * 1.8,
        zIndex: 3,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <svg width={pointerSize * 1.3} height={pointerSize * 1.8}>
        <defs>
          <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
        <polygon
          points={`${pointerSize*0.65},${pointerSize*1.8} ${pointerSize*1.1},${pointerSize*0.4} ${pointerSize*0.2},${pointerSize*0.4}`}
          fill="url(#pointerGradient)"
          stroke="#8B4513"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default WheelPointer;

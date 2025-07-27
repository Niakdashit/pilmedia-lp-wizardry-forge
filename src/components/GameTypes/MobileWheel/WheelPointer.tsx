
import React from 'react';

interface WheelPointerProps {
  pointerColor: string;
  gamePosition: 'left' | 'right' | 'center' | 'top' | 'bottom';
  containerWidth: number;
  canvasSize: number;
  shouldCropWheel: boolean;
}

const WheelPointer: React.FC<WheelPointerProps> = ({
  pointerColor,
  gamePosition,
  containerWidth,
  canvasSize,
  shouldCropWheel
}) => {
  const getPointerPosition = () => {
    if (shouldCropWheel) {
      return gamePosition === 'left' 
        ? containerWidth - 20  // Pour left, pointeur au bord droit du conteneur visible
        : -20;  // Pour right, pointeur au bord gauche du conteneur visible
    }
    return canvasSize / 2 - 20;  // Position normale au centre
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: getPointerPosition(),
        top: -25,
        width: 40,
        height: 60,
        zIndex: 3,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <svg width="40" height="60">
        <polygon
          points="20,60 32,18 8,18"
          fill={pointerColor}
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default WheelPointer;

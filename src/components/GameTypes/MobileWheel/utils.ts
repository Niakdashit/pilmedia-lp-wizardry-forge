
export const getContainerWidth = (canvasSize: number, shouldCropWheel: boolean): number => {
  if (!shouldCropWheel) return canvasSize;

  // Coupe toujours exactement la moitié de la roue
  return canvasSize * 0.5;
};

export const getCanvasOffset = (
  shouldCropWheel: boolean,
  gamePosition: 'left' | 'right' | 'center' | 'top' | 'bottom',
  canvasSize: number
): string => {
  if (!shouldCropWheel) return '0px';

  if (gamePosition === 'left') {
    // Décale la roue pour n'afficher que sa moitié droite
    return `-${canvasSize * 0.5}px`;
  } else { // right
    // Décale la roue pour n'afficher que sa moitié gauche
    return '0px';
  }
};

export const getGameAbsoluteStyle = (
  gamePosition: 'left' | 'right' | 'center' | 'top' | 'bottom',
  containerWidth: number,
  canvasSize: number
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    pointerEvents: 'none' as const
  };

  switch (gamePosition) {
    case 'left':
      return {
        ...baseStyle,
        left: '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: containerWidth,
        height: canvasSize,
        overflow: 'hidden'
      };
    case 'right':
      return {
        ...baseStyle,
        right: '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: containerWidth,
        height: canvasSize,
        overflow: 'hidden'
      };
    case 'top':
      return {
        ...baseStyle,
        top: `-${canvasSize / 2}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: canvasSize,
        height: canvasSize
      };
    case 'bottom':
      return {
        ...baseStyle,
        bottom: `-${canvasSize / 2}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: canvasSize,
        height: canvasSize
      };
    case 'center':
    default:
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: canvasSize,
        height: canvasSize
      };
  }
};


import { GameSize, GAME_SIZES } from '../configurators/GameSizeSelector';

interface GamePositionCalculatorProps {
  gameSize: GameSize;
  gamePosition: string;
  shouldCropWheel: boolean;
}

export const useGamePositionCalculator = ({
  gameSize,
  gamePosition,
  shouldCropWheel
}: GamePositionCalculatorProps) => {
  const gameDimensions = GAME_SIZES[gameSize];

  const getPositionStyles = () => {
    const baseStyles = {
      width: `${gameDimensions.width}px`,
      height: `${gameDimensions.height}px`,
      maxWidth: `${gameDimensions.width}px`,
      maxHeight: `${gameDimensions.height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    // For wheel games with mobile cropping, let WheelContainer handle positioning completely
    if (shouldCropWheel) {
      return {
        width: '100%',
        height: '100%',
        position: 'relative' as const
      };
    }

    // Default positioning for non-cropped cases
    switch (gamePosition) {
      case 'top':
        return {
          ...baseStyles,
          alignSelf: 'flex-start',
          margin: '20px auto 0 auto'
        };
      case 'bottom':
        return {
          ...baseStyles,
          alignSelf: 'flex-end',
          margin: '0 auto 20px auto'
        };
      case 'left':
        return {
          ...baseStyles,
          alignSelf: 'center',
          margin: 'auto 0 auto 20px'
        };
      case 'right':
        return {
          ...baseStyles,
          alignSelf: 'center',
          margin: 'auto 20px auto 0'
        };
      case 'center':
      default:
        return {
          ...baseStyles,
          alignSelf: 'center',
          margin: 'auto'
        };
    }
  };

  return {
    gameDimensions,
    getPositionStyles
  };
};

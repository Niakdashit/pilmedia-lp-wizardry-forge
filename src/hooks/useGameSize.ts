import { useMemo } from 'react';
import { GAME_SIZES, GameSize } from '../components/configurators/GameSizeSelector';
export const useGameSize = (size: GameSize = 'medium') => {
  const getGameDimensions = useMemo(() => {
    return () => GAME_SIZES[size];
  }, [size]);

  const getContainerDimensions = useMemo(() => {
    return (containerSize: 'small' | 'medium' | 'large' = 'medium') => {
      switch (containerSize) {
        case 'small':
          return { width: 400, height: 300 };
        case 'medium':
          return { width: 600, height: 450 };
        case 'large':
          return { width: 800, height: 600 };
        default:
          return { width: 600, height: 450 };
      }
    };
  }, []);

  const getResponsiveDimensions = useMemo(() => {
    return (device: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
      const baseDimensions = getGameDimensions();
      
      switch (device) {
        case 'mobile':
          // Mobile: Optimisé pour écrans tactiles
          return {
            width: Math.min(320, baseDimensions.width),
            height: Math.min(480, baseDimensions.height)
          };
        case 'tablet':
          // Tablet: Équilibré pour format tablette
          return {
            width: Math.min(600, baseDimensions.width * 1.2),
            height: Math.min(450, baseDimensions.height * 1.2)
          };
        case 'desktop':
        default:
          // Desktop: Format 16:9 optimisé avec échelle réduite
          return {
            width: Math.min(800, baseDimensions.width * 1.6),
            height: Math.min(450, baseDimensions.height * 1.5)
          };
      }
    };
  }, [getGameDimensions]);

  return {
    getGameDimensions,
    getContainerDimensions,
    getResponsiveDimensions,
    currentSize: size
  };
};

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
          // Mobile: realistic iPhone size - much larger for better UX
          const mobileScale = Math.min(500 / baseDimensions.width, 500 / baseDimensions.height);
          return {
            width: Math.floor(baseDimensions.width * mobileScale),
            height: Math.floor(baseDimensions.height * mobileScale)
          };
        case 'tablet':
          // Tablet: realistic iPad size - much larger for better UX
          const tabletScale = Math.min(700 / baseDimensions.width, 700 / baseDimensions.height);
          return {
            width: Math.floor(baseDimensions.width * tabletScale),
            height: Math.floor(baseDimensions.height * tabletScale)
          };
        case 'desktop':
        default:
          return baseDimensions;
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

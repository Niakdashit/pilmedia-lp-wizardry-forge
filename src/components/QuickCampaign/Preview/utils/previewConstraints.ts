
export interface PreviewConstraints {
  maxWidth: number;
  maxHeight: number;
  aspectRatio?: number;
}

export const DEVICE_CONSTRAINTS = {
  desktop: {
    maxWidth: 1400,
    maxHeight: 900,
  },
  tablet: {
    maxWidth: 768,
    maxHeight: 1024,
    aspectRatio: 768 / 1024,
  },
  mobile: {
    maxWidth: 375,
    maxHeight: 667,
    aspectRatio: 375 / 667,
  },
} as const;

export const GAME_CONSTRAINTS = {
  wheel: {
    minSize: 200,
    maxSize: 500,
    defaultSize: 300,
  },
  jackpot: {
    minWidth: 250,
    maxWidth: 500,
    minHeight: 150,
    maxHeight: 300,
  },
  quiz: {
    minWidth: 300,
    maxWidth: 600,
    minHeight: 200,
    maxHeight: 400,
  },
} as const;

export const calculateConstrainedSize = (
  containerWidth: number,
  containerHeight: number,
  gameType: string,
  padding: number = 40
): { width: number; height: number } => {
  const availableWidth = containerWidth - padding;
  const availableHeight = containerHeight - padding;

  switch (gameType) {
    case 'wheel': {
      const { minSize, maxSize } = GAME_CONSTRAINTS.wheel;
      const size = Math.max(minSize, Math.min(maxSize, Math.min(availableWidth, availableHeight)));
      return { width: size, height: size };
    }
    case 'jackpot': {
      const { minWidth, maxWidth, minHeight, maxHeight } = GAME_CONSTRAINTS.jackpot;
      const width = Math.max(minWidth, Math.min(maxWidth, availableWidth));
      const height = Math.max(minHeight, Math.min(maxHeight, availableHeight * 0.6));
      return { width, height };
    }
    case 'quiz': {
      const { minWidth, maxWidth, minHeight, maxHeight } = GAME_CONSTRAINTS.quiz;
      const width = Math.max(minWidth, Math.min(maxWidth, availableWidth));
      const height = Math.max(minHeight, Math.min(maxHeight, availableHeight * 0.8));
      return { width, height };
    }
    default:
      return {
        width: Math.min(availableWidth, 400),
        height: Math.min(availableHeight, 300),
      };
  }
};

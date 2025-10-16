export const DEVICE_CONSTRAINTS = {
  desktop: { width: 1024, height: 768, maxWidth: 1024, maxHeight: 768, aspectRatio: 4/3 },
  tablet: { width: 768, height: 1024, maxWidth: 768, maxHeight: 1024, aspectRatio: 3/4 },
  mobile: { width: 375, height: 667, maxWidth: 375, maxHeight: 667, aspectRatio: 9/16 }
} as const;

export const GAME_CONSTRAINTS = {
  wheel: {
    maxSize: 512,
  },
} as const;

export type GameType = keyof typeof GAME_CONSTRAINTS;

/**
 * Given available width/height and a game type, return a constrained box size
 * that respects the game's maximum size while preserving a square aspect.
 */
export function calculateConstrainedSize(
  availableWidth: number,
  availableHeight: number,
  type: GameType,
  padding: number = 0
): { width: number; height: number } {
  const max = GAME_CONSTRAINTS[type]?.maxSize ?? 512;
  const availableSpace = Math.min(availableWidth - padding, availableHeight - padding);
  const side = Math.min(max, availableSpace);
  return { width: side, height: side };
}

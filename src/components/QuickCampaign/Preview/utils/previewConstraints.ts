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
  type: GameType
): { width: number; height: number } {
  const max = GAME_CONSTRAINTS[type]?.maxSize ?? 512;
  const side = Math.min(max, Math.min(availableWidth, availableHeight));
  return { width: side, height: side };
}


// Utilitaire pour déterminer le bon funnel selon le type de jeu
export const UNLOCKED_GAME_TYPES = ['wheel', 'scratch', 'jackpot', 'dice'] as const;
export const STANDARD_GAME_TYPES = ['form', 'quiz', 'memory', 'puzzle'] as const;

export type UnlockedGameType = typeof UNLOCKED_GAME_TYPES[number];
export type StandardGameType = typeof STANDARD_GAME_TYPES[number];
export type GameType = UnlockedGameType | StandardGameType;

/**
 * Détermine si un type de jeu doit utiliser le funnel unlocked
 */
export const shouldUseUnlockedFunnel = (gameType: string): boolean => {
  return UNLOCKED_GAME_TYPES.includes(gameType as UnlockedGameType);
};

/**
 * Détermine si un type de jeu doit utiliser le funnel standard
 */
export const shouldUseStandardFunnel = (gameType: string): boolean => {
  return STANDARD_GAME_TYPES.includes(gameType as StandardGameType);
};

/**
 * Valide que le funnel configuré correspond au type de jeu
 */
export const validateFunnelForGameType = (gameType: string, configuredFunnel?: string): {
  isValid: boolean;
  expectedFunnel: 'unlocked_game' | 'standard';
  message?: string;
} => {
  const shouldUseUnlocked = shouldUseUnlockedFunnel(gameType);
  const expectedFunnel = shouldUseUnlocked ? 'unlocked_game' : 'standard';
  
  if (!configuredFunnel) {
    return {
      isValid: true,
      expectedFunnel,
      message: `Funnel par défaut appliqué: ${expectedFunnel}`
    };
  }

  const isValid = (shouldUseUnlocked && configuredFunnel === 'unlocked_game') ||
                  (!shouldUseUnlocked && configuredFunnel === 'standard');

  return {
    isValid,
    expectedFunnel,
    message: isValid ? undefined : `Type de jeu "${gameType}" devrait utiliser le funnel "${expectedFunnel}" au lieu de "${configuredFunnel}"`
  };
};

/**
 * Feature flags configuration
 */
export const features = {
  /**
   * Enable the new ScratchCard Game system
   * When disabled, falls back to the old ScratchGrid system
   */
  scratchcardGame: true,
} as const;

export type FeatureFlags = typeof features;
export type FeatureKey = keyof FeatureFlags;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureKey): boolean => {
  return features[feature];
};
/**
 * Feature flags configuration for the application
 * These flags control the availability of features without code changes
 */

export interface FeatureFlags {
  /** Enable the new ScratchCard game feature to replace the 4 cards */
  scratchcardGame: boolean;
  /** Enable advanced wheel customization features */
  advancedWheel: boolean;
  /** Enable beta features for testing */
  betaFeatures: boolean;
}

export const features: FeatureFlags = {
  scratchcardGame: true, // Enable the new scratch card game
  advancedWheel: true,
  betaFeatures: false
};

/**
 * Check if a feature is enabled
 * @param feature The feature flag to check
 * @returns Whether the feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return features[feature] ?? false;
};

/**
 * Get all enabled features
 * @returns Array of enabled feature names
 */
export const getEnabledFeatures = (): string[] => {
  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);
};

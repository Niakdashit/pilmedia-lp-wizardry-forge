// Feature flags configuration
export const features = {
  // Slot Jackpot game integration
  slotJackpot: true,
  
  // Other feature flags can be added here
  // experimentalFeature: false,
} as const;

export type FeatureFlag = keyof typeof features;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return features[flag] ?? false;
};

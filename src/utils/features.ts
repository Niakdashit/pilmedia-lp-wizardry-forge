// Feature flags configuration
export const features = {
  slotJackpot: true, // Enable/disable Slot Jackpot game in JackpotEditor
  // Add other feature flags here as needed
};

export const isFeatureEnabled = (featureName: keyof typeof features): boolean => {
  return features[featureName] ?? false;
};


// Helper function to validate and sanitize colors
export const validateColors = (colors: any) => {
  const defaultColors = {
    primary: '#d4dbe8',
    secondary: '#1e40af',
    accent: '#0ea5e9',
    textColor: '#000000'
  };

  if (!colors || typeof colors !== 'object') {
    console.warn('Invalid colors object, using defaults:', colors);
    return defaultColors;
  }

  return {
    primary: (colors.primary && typeof colors.primary === 'string' && colors.primary.startsWith('#')) 
      ? colors.primary : defaultColors.primary,
    secondary: (colors.secondary && typeof colors.secondary === 'string' && colors.secondary.startsWith('#')) 
      ? colors.secondary : defaultColors.secondary,
    accent: (colors.accent && typeof colors.accent === 'string' && colors.accent.startsWith('#')) 
      ? colors.accent : defaultColors.accent,
    textColor: (colors.textColor && typeof colors.textColor === 'string') 
      ? colors.textColor : defaultColors.textColor
  };
};

// Helper function to validate QuickCampaign data
export const validateQuickCampaignData = (data: any) => {
  console.log('Validating QuickCampaign data:', data);
  
  if (!data || typeof data !== 'object') {
    console.error('Invalid QuickCampaign data structure');
    return null;
  }

  // Validate essential properties
  if (!data.name && !data.campaignName) {
    console.error('Missing campaign name in QuickCampaign data');
    return null;
  }

  if (!data.type && !data.selectedGameType) {
    console.error('Missing game type in QuickCampaign data');
    return null;
  }

  return {
    ...data,
    name: data.name || data.campaignName,
    type: data.type || data.selectedGameType,
    customColors: validateColors(data.customColors || data.design?.customColors)
  };
};

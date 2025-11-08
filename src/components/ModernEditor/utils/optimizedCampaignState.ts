// Utilitaires pour optimiser la gestion d'état des campagnes

export const createCampaignUpdateTracker = () => {
  let updateCounter = 0;
  
  return {
    getNextUpdate: () => {
      updateCounter++;
      return updateCounter;
    },
    
    markCampaignUpdated: (campaign: any) => {
      return {
        ...campaign,
        _lastUpdate: Date.now(),
        _updateCounter: updateCounter++
      };
    }
  };
};

export const campaignUpdateTracker = createCampaignUpdateTracker();

// Fonction pour merger intelligemment les configurations
export const mergeGameConfig = (defaultConfig: any, newConfig: any) => {
  const merged = {
    ...defaultConfig,
    ...newConfig
  };
  
  // Validation spécifique pour les segments de roue
  if (merged.wheel?.segments && Array.isArray(merged.wheel.segments)) {
    merged.wheel.segments = merged.wheel.segments.filter((segment: any) =>
      segment && typeof segment === 'object' && (typeof segment.label === 'string')
    );
  }
  
  return merged;
};

// Fonction pour normaliser les couleurs
export const normalizeColors = (colors: any) => {
  if (!colors || typeof colors !== 'object') {
    return {
      primary: '#E0004D',
      secondary: '#dc2626',
      accent: '#ffffff',
      text: '#ffffff'
    };
  }
  
  return {
    primary: colors.primary || '#E0004D',
    secondary: colors.secondary || '#dc2626',
    accent: colors.accent || '#ffffff',
    text: colors.text || '#ffffff'
  };
};
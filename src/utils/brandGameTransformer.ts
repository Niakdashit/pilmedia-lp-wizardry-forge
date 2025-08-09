
import { GeneratedGameConcept } from '../services/openAIGameGeneratorService';

export const transformBrandGameToCampaign = (concept: GeneratedGameConcept) => {
  console.log('Transforming studio-level brand game concept:', concept);
  
  // Enhanced campaign structure for studio-level quality
  const studioBaseCampaign = {
    id: `studio-brand-${Date.now()}`,
    name: concept.gameName,
    type: concept.gameType,
    title: concept.content.title,
    description: concept.content.description,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Enhanced design with premium features
    design: {
      customColors: concept.colors,
      centerLogo: concept.logo,
      logoUrl: concept.logo,
      background: concept.colors.background,
      backgroundGradient: `linear-gradient(135deg, ${concept.colors.primary}15, ${concept.colors.secondary}15)`,
      borderRadius: concept.design.borderRadius,
      shadows: concept.design.shadows,
      animations: concept.design.animations,
      premiumEffects: concept.design.premiumEffects || {},
      typography: {
        primary: concept.design.fontFamily,
        headingWeight: 'bold',
        bodyWeight: 'medium'
      }
    },
    
    // Enhanced button configuration
    buttonConfig: {
      text: concept.content.buttonText,
      color: concept.colors.primary,
      textColor: getContrastColor(concept.colors.primary),
      borderColor: concept.colors.primary,
      borderRadius: parseInt(concept.design.borderRadius) || 12,
      size: 'large',
      hoverEffect: true,
      gradient: concept.design.premiumEffects?.gradient || false
    },
    
    // Enhanced content structure
    content: {
      title: concept.content.title,
      description: concept.content.description,
      successMessage: concept.content.successMessage,
      buttonText: concept.content.buttonText,
      marketingCopy: {
        urgency: concept.marketingStrategy?.engagementTactics?.includes('urgence'),
        exclusivity: concept.marketingStrategy?.engagementTactics?.includes('exclusivité'),
        socialProof: concept.marketingStrategy?.socialProof || false
      }
    },
    
    // Premium mobile configuration
    mobileConfig: {
      optimized: true,
      touchFriendly: true,
      responsiveDesign: true,
      gamePosition: 'center',
      fullScreenMode: concept.gameType === 'wheel' || concept.gameType === 'scratch'
    }
  };

  // Add enhanced game-specific configuration
  const enhancedGameConfig = {
    ...studioBaseCampaign,
    gameConfig: {
      [concept.gameType]: {
        ...concept.gameConfig,
        buttonLabel: concept.content.buttonText,
        buttonColor: concept.colors.primary,
        logo: concept.logo,
        premiumMode: true,
        studioLevel: true,
        animations: concept.design.animations,
        microInteractions: concept.design.premiumEffects?.microInteractions || false
      }
    }
  };

  // Enhanced game-specific configurations
  switch (concept.gameType) {
    case 'wheel':
      return {
        ...enhancedGameConfig,
        config: {
          roulette: {
            borderColor: concept.colors.primary,
            borderOutlineColor: concept.colors.accent,
            segmentColor1: concept.colors.primary,
            segmentColor2: '#ffffff',
            centerLogo: concept.logo,
            premiumPointer: true,
            glowEffect: concept.design.premiumEffects?.glassmorphism || false,
            segments: concept.gameConfig.segments?.map((segment, index) => ({
              ...segment,
              id: index,
              winProbability: segment.probability || 0.15,
              premiumStyling: true,
              color: index % 2 === 0 ? concept.colors.primary : '#ffffff',
              textColor: index % 2 === 0 ? '#ffffff' : concept.colors.primary,
              gradient: `linear-gradient(45deg, ${segment.color}, ${adjustColorBrightness(segment.color, 20)})`
            })) || []
          }
        }
      };
      
    case 'quiz':
      return {
        ...enhancedGameConfig,
        gameConfig: {
          quiz: {
            questions: concept.gameConfig.questions?.map(q => ({
              ...q,
              premiumStyling: true,
              animations: true
            })) || [],
            prizes: concept.gameConfig.prizes,
            rules: concept.gameConfig.rules,
            logo: concept.logo,
            colors: concept.colors,
            studioMode: true,
            progressIndicator: true,
            soundEffects: true
          }
        }
      };
      
    case 'scratch':
      return {
        ...enhancedGameConfig,
        gameConfig: {
          scratch: {
            prizes: concept.gameConfig.prizes,
            rules: concept.gameConfig.rules,
            logo: concept.logo,
            colors: concept.colors,
            backgroundColor: concept.colors.background,
            scratchColor: concept.colors.secondary,
            premiumTexture: true,
            particleEffects: concept.design.premiumEffects?.microInteractions || false,
            satisfyingFeedback: true
          }
        }
      };
      
    case 'jackpot':
      return {
        ...enhancedGameConfig,
        gameConfig: {
          jackpot: {
            prizes: concept.gameConfig.prizes,
            rules: concept.gameConfig.rules,
            logo: concept.logo,
            colors: concept.colors,
            containerBackgroundColor: concept.colors.background,
            backgroundColor: concept.colors.accent,
            borderColor: concept.colors.primary,
            premiumSlots: true,
            neonEffects: concept.design.premiumEffects?.glassmorphism || false,
            cascadeAnimation: true,
            winCelebration: true
          }
        }
      };
      
    default:
      return enhancedGameConfig;
  }
};

// Utility functions for enhanced styling
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function adjustColorBrightness(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

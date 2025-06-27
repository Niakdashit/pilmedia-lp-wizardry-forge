
import { GeneratedGameConcept } from '../services/openAIGameGeneratorService';

export const transformBrandGameToCampaign = (concept: GeneratedGameConcept) => {
  console.log('Transforming brand game concept:', concept);
  
  // Base campaign structure
  const baseCampaign = {
    id: `brand-${Date.now()}`,
    name: concept.gameName,
    type: concept.gameType,
    title: concept.content.title,
    description: concept.content.description,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    design: {
      customColors: concept.colors,
      centerLogo: concept.logo,
      logoUrl: concept.logo,
      ...concept.design
    },
    buttonConfig: {
      text: concept.content.buttonText,
      color: concept.colors.primary,
      textColor: concept.colors.accent,
      borderColor: concept.colors.primary
    },
    content: {
      title: concept.content.title,
      description: concept.content.description,
      successMessage: concept.content.successMessage,
      buttonText: concept.content.buttonText
    }
  };

  // Add game-specific configuration
  const gameConfig = {
    ...baseCampaign,
    gameConfig: {
      [concept.gameType]: {
        ...concept.gameConfig,
        buttonLabel: concept.content.buttonText,
        buttonColor: concept.colors.primary,
        logo: concept.logo
      }
    }
  };

  // Add specific configurations based on game type
  switch (concept.gameType) {
    case 'wheel':
      return {
        ...gameConfig,
        config: {
          roulette: {
            borderColor: concept.colors.primary,
            borderOutlineColor: concept.colors.accent,
            segmentColor1: concept.colors.primary,
            segmentColor2: concept.colors.secondary,
            centerLogo: concept.logo,
            segments: concept.gameConfig.segments?.map((segment, index) => ({
              ...segment,
              id: index,
              winProbability: segment.probability || 0.1
            })) || []
          }
        }
      };
      
    case 'quiz':
      return {
        ...gameConfig,
        gameConfig: {
          quiz: {
            questions: concept.gameConfig.questions || [],
            prizes: concept.gameConfig.prizes,
            rules: concept.gameConfig.rules,
            logo: concept.logo,
            colors: concept.colors
          }
        }
      };
      
    case 'scratch':
      return {
        ...gameConfig,
        gameConfig: {
          scratch: {
            prizes: concept.gameConfig.prizes,
            rules: concept.gameConfig.rules,
            logo: concept.logo,
            colors: concept.colors,
            backgroundColor: concept.colors.background,
            scratchColor: concept.colors.secondary
          }
        }
      };
      
    case 'jackpot':
      return {
        ...gameConfig,
        gameConfig: {
          jackpot: {
            prizes: concept.gameConfig.prizes,
            rules: concept.gameConfig.rules,
            logo: concept.logo,
            colors: concept.colors,
            containerBackgroundColor: concept.colors.background,
            backgroundColor: concept.colors.accent,
            borderColor: concept.colors.primary
          }
        }
      };
      
    default:
      return gameConfig;
  }
};

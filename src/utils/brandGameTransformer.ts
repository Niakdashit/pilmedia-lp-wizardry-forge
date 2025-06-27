
import { GeneratedGameConcept } from '../services/openAIGameGeneratorService';
import { BrandData } from '../services/scrapingBeeService';
import { CampaignType } from './campaignTypes';

export interface TransformedCampaignData {
  type: CampaignType;
  name: string;
  description: string;
  design: any;
  gameConfig: any;
  screens: any;
  buttonConfig: any;
  formFields: any[];
}

export const transformBrandGameToCampaign = (
  gameConcept: GeneratedGameConcept,
  brandData: BrandData
): TransformedCampaignData => {
  const baseConfig = {
    type: gameConcept.gameType as CampaignType,
    name: gameConcept.gameName,
    description: gameConcept.content.description,
    design: {
      background: gameConcept.colors.background,
      primaryColor: gameConcept.colors.primary,
      secondaryColor: gameConcept.colors.secondary,
      titleColor: gameConcept.colors.primary,
      buttonColor: gameConcept.colors.primary,
      fontFamily: gameConcept.design.fontFamily,
      borderRadius: gameConcept.design.borderRadius,
      customColors: {
        primary: gameConcept.colors.primary,
        secondary: gameConcept.colors.secondary,
        accent: gameConcept.colors.accent,
        text: '#ffffff'
      },
      textStyles: {
        title: {
          fontFamily: gameConcept.design.fontFamily,
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center' as const,
          color: gameConcept.colors.primary,
          lineHeight: '1.2'
        },
        description: {
          fontFamily: gameConcept.design.fontFamily,
          fontSize: '16px',
          fontWeight: 'normal',
          textAlign: 'center' as const,
          color: gameConcept.colors.secondary,
          lineHeight: '1.5'
        }
      }
    },
    screens: {
      1: {
        title: gameConcept.content.title,
        description: gameConcept.content.description,
        buttonText: gameConcept.content.buttonText,
        showTitle: true,
        showDescription: true
      },
      3: {
        title: 'Félicitations !',
        description: gameConcept.content.successMessage,
        showTitle: true,
        showDescription: true
      }
    },
    buttonConfig: {
      color: gameConcept.colors.primary,
      borderColor: gameConcept.colors.primary,
      borderWidth: 2,
      borderRadius: 8,
      size: 'medium' as const,
      text: gameConcept.content.buttonText,
      visible: true
    },
    formFields: [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ]
  };

  // Game-specific configurations
  switch (gameConcept.gameType) {
    case 'wheel':
      return {
        ...baseConfig,
        gameConfig: {
          wheel: {
            segments: gameConcept.gameConfig.segments || [],
            speed: 'medium',
            mode: 'random',
            borderColor: gameConcept.colors.primary,
            borderWidth: 3
          }
        }
      };

    case 'quiz':
      return {
        ...baseConfig,
        gameConfig: {
          quiz: {
            questions: gameConcept.gameConfig.questions || [],
            shuffleQuestions: true,
            shuffleAnswers: true,
            timeLimit: 30,
            passingScore: 70
          }
        }
      };

    case 'scratch':
      return {
        ...baseConfig,
        gameConfig: {
          scratch: {
            cards: gameConcept.gameConfig.prizes.map((prize, index) => ({
              id: index + 1,
              prize,
              isWinner: index === 0,
              revealPercentage: 50
            })),
            surfaceColor: gameConcept.colors.secondary,
            scratchColor: gameConcept.colors.primary
          }
        }
      };

    case 'jackpot':
      return {
        ...baseConfig,
        gameConfig: {
          jackpot: {
            symbols: gameConcept.gameConfig.prizes.slice(0, 5),
            winCondition: 'three_of_a_kind',
            spinSpeed: 'medium',
            reelCount: 3
          }
        }
      };

    default:
      return {
        ...baseConfig,
        gameConfig: {
          [gameConcept.gameType]: {
            prizes: gameConcept.gameConfig.prizes,
            rules: gameConcept.gameConfig.rules
          }
        }
      };
  }
};

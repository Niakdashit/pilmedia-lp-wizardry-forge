import { QuickCampaignState } from './types';

// Helper function to validate and sanitize colors
const validateAndSanitizeColors = (colors: any) => {
  const defaultColors = {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#0ea5e9',
    textColor: '#000000'
  };

  if (!colors || typeof colors !== 'object') {
    console.warn('Invalid colors in QuickCampaign, using defaults');
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

export const generatePreviewCampaign = (state: QuickCampaignState) => {
  console.log('Generating preview campaign from state:', state);
  
  // Validate essential data
  if (!state.campaignName) {
    console.error('Missing campaign name in QuickCampaign state');
    throw new Error('Nom de campagne requis');
  }

  if (!state.selectedGameType) {
    console.error('Missing game type in QuickCampaign state');
    throw new Error('Type de jeu requis');
  }

  // Sanitize colors
  const safeColors = validateAndSanitizeColors(state.customColors);
  console.log('Safe colors for campaign:', safeColors);

  const baseConfig = {
    id: 'quick-preview',
    name: state.campaignName,
    type: state.selectedGameType || 'wheel',
    status: 'draft',
    description: `Campagne ${state.selectedGameType} créée avec QuickCampaign`,
    
    // Informations générales
    general: {
      name: state.campaignName,
      description: `Campagne ${state.selectedGameType} créée avec QuickCampaign`,
      launchDate: state.launchDate,
      marketingGoal: state.marketingGoal,
      brandSiteUrl: state.brandSiteUrl,
      url: state.brandSiteUrl
    },

    // Configuration du design - structure complète pour ModernEditor
    design: {
      customColors: safeColors,
      centerLogo: state.logoUrl || null,
      backgroundImage: state.backgroundImageUrl || null,
      mobileBackgroundImage: state.backgroundImageUrl || null,
      containerBackgroundColor: '#ffffff',
      borderColor: safeColors.primary,
      borderRadius: '16px',
      buttonColor: safeColors.accent,
      buttonTextColor: safeColors.primary,
      textColor: safeColors.textColor,
      theme: state.selectedTheme || 'default',
      fontUrl: state.fontUrl,
      // Ajout des propriétés requises par ModernEditor
      primaryColor: safeColors.primary,
      secondaryColor: safeColors.secondary,
      accentColor: safeColors.accent,
      backgroundColor: '#ffffff',
      textPrimaryColor: safeColors.textColor,
      textSecondaryColor: '#666666'
    },

    // Configuration des boutons
    buttonConfig: {
      color: safeColors.accent,
      textColor: safeColors.primary,
      borderColor: safeColors.primary,
      borderWidth: 2,
      borderRadius: 8,
      size: 'medium',
      text: 'Jouer maintenant !',
      visible: true,
      style: safeColors.buttonStyle || 'primary',
      backgroundColor: safeColors.accent,
      hoverColor: safeColors.primary
    },

    // Configuration mobile
    mobileConfig: {
      gamePosition: state.gamePosition || 'center',
      buttonColor: safeColors.accent,
      buttonTextColor: safeColors.primary,
      buttonPlacement: 'bottom'
    },

    // Taille et position du jeu
    gameSize: 'medium',
    gamePosition: state.gamePosition || 'center',

    // Écrans par défaut avec personnalisation
    screens: {
      welcome: {
        title: 'Prêt à jouer ?',
        description: 'Participez à notre jeu et tentez de gagner des prix !',
        buttonText: 'Participer',
        backgroundColor: '#ffffff',
        textColor: safeColors.textColor || '#000000'
      },
      form: {
        title: 'Vos informations',
        description: 'Remplissez le formulaire pour continuer',
        buttonText: "C'est parti !",
        backgroundColor: '#ffffff',
        textColor: safeColors.textColor || '#000000'
      },
      game: {
        title: 'Jouez maintenant !',
        description: 'Bonne chance !',
        buttonText: 'Jouer',
        backgroundColor: '#ffffff',
        textColor: safeColors.textColor || '#000000'
      },
      result: {
        title: 'Merci !',
        description: 'Merci pour votre participation !',
        confirmationTitle: 'Félicitations !',
        confirmationMessage: 'Votre participation a été enregistrée.',
        replayButtonText: 'Rejouer',
        winMessage: 'Bravo ! Vous avez gagné !',
        loseMessage: 'Pas de chance cette fois !',
        backgroundColor: '#ffffff',
        textColor: safeColors.textColor || '#000000'
      }
    },

    // Champs de formulaire par défaut
    formFields: [
      { id: '1', type: 'text', label: 'Nom', required: true, placeholder: 'Votre nom' },
      { id: '2', type: 'email', label: 'Email', required: true, placeholder: 'votre@email.com' },
      { id: '3', type: 'phone', label: 'Téléphone', required: false, placeholder: 'Votre numéro' }
    ],

    // Configuration des jeux
    config: {
      roulette: {}
    },
    gameConfig: {}
  };

  // Configuration spécifique par type de jeu
  switch (state.selectedGameType) {
    case 'wheel':
      baseConfig.config.roulette = {
        segments: Array.from({ length: state.segmentCount }).map((_, i) => ({
          id: i + 1,
          label: `Segment ${i + 1}`,
          color: i % 2 === 0 ? safeColors.primary : safeColors.secondary,
          image: null,
          winProbability: 100 / state.segmentCount
        })),
        borderColor: safeColors.secondary,
        borderOutlineColor: safeColors.accent,
        segmentColor1: safeColors.primary,
        segmentColor2: safeColors.secondary,
        theme: state.selectedTheme,
        // Propriétés avancées de la roue
        wheelCustomization: state.wheelCustomization,
        customPointer: state.customPointer,
        wheelCenter: state.wheelCenter
      };

      baseConfig.gameConfig = {
        wheel: {
          mode: 'instant_winner',
          winProbability: 0.1,
          maxWinners: 10,
          winnersCount: 0,
          segments: Array.from({ length: state.segmentCount }).map((_, i) => ({
            id: i + 1,
            label: `Segment ${i + 1}`,
            color: i % 2 === 0 ? safeColors.primary : safeColors.secondary,
            image: null,
            winProbability: 100 / state.segmentCount
          }))
        }
      };
      break;

    case 'quiz':
      baseConfig.gameConfig = {
        quiz: {
          questions: state.quizQuestions.map(q => ({
            ...q,
            backgroundColor: safeColors.primary,
            textColor: safeColors.textColor || '#ffffff'
          })),
          timePerQuestion: 30,
          buttonLabel: 'Commencer le Quiz',
          buttonColor: safeColors.accent,
          primaryColor: safeColors.primary,
          secondaryColor: safeColors.secondary
        }
      };
      break;

    case 'jackpot':
      baseConfig.gameConfig = {
        jackpot: {
          instantWin: {
            mode: 'instant_winner',
            winProbability: 0.1,
            maxWinners: 10,
            winnersCount: 0
          },
          buttonLabel: 'Lancer le Jackpot',
          ...state.jackpotColors,
          colors: state.jackpotColors
        }
      };
      break;

    case 'scratch':
      baseConfig.gameConfig = {
        scratch: {
          cards: [
            {
              id: 1,
              revealImage: '',
              revealMessage: 'Félicitations !',
              scratchColor: '#C0C0C0',
              backgroundColor: safeColors.primary,
              textColor: safeColors.textColor || '#ffffff'
            }
          ],
          buttonLabel: 'Gratter',
          winMessage: 'Bravo ! Vous avez gagné !',
          loseMessage: 'Pas de chance cette fois !',
          primaryColor: safeColors.primary,
          secondaryColor: safeColors.secondary
        }
      };
      break;

    default:
      break;
  }

  console.log('Generated campaign config:', baseConfig);
  return baseConfig;
};

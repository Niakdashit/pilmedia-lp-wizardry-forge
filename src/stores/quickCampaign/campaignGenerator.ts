
import { QuickCampaignState } from './types';

export const generatePreviewCampaign = (state: QuickCampaignState) => {
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
      customColors: state.customColors,
      centerLogo: state.logoUrl || null,
      backgroundImage: state.backgroundImageUrl || null,
      mobileBackgroundImage: state.backgroundImageUrl || null,
      containerBackgroundColor: '#ffffff',
      borderColor: state.customColors.primary,
      borderRadius: '16px',
      buttonColor: state.customColors.accent,
      buttonTextColor: state.customColors.primary,
      textColor: state.customColors.textColor || '#000000',
      theme: state.selectedTheme,
      fontUrl: state.fontUrl,
      // Ajout des propriétés requises par ModernEditor
      primaryColor: state.customColors.primary,
      secondaryColor: state.customColors.secondary,
      accentColor: state.customColors.accent,
      backgroundColor: '#ffffff',
      textPrimaryColor: state.customColors.textColor || '#000000',
      textSecondaryColor: '#666666'
    },

    // Configuration des boutons
    buttonConfig: {
      color: state.customColors.accent,
      textColor: state.customColors.primary,
      borderColor: state.customColors.primary,
      borderWidth: 2,
      borderRadius: 8,
      size: 'medium',
      text: 'Jouer maintenant !',
      visible: true,
      style: state.customColors.buttonStyle || 'primary',
      backgroundColor: state.customColors.accent,
      hoverColor: state.customColors.primary
    },

    // Configuration mobile
    mobileConfig: {
      gamePosition: state.gamePosition,
      buttonColor: state.customColors.accent,
      buttonTextColor: state.customColors.primary,
      buttonPlacement: 'bottom'
    },

    // Taille et position du jeu
    gameSize: 'medium',
    gamePosition: state.gamePosition,

    // Écrans par défaut avec personnalisation
    screens: {
      welcome: {
        title: 'Prêt à jouer ?',
        description: 'Participez à notre jeu et tentez de gagner des prix !',
        buttonText: 'Participer',
        backgroundColor: '#ffffff',
        textColor: state.customColors.textColor || '#000000'
      },
      form: {
        title: 'Vos informations',
        description: 'Remplissez le formulaire pour continuer',
        buttonText: "C'est parti !",
        backgroundColor: '#ffffff',
        textColor: state.customColors.textColor || '#000000'
      },
      game: {
        title: 'Jouez maintenant !',
        description: 'Bonne chance !',
        buttonText: 'Jouer',
        backgroundColor: '#ffffff',
        textColor: state.customColors.textColor || '#000000'
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
        textColor: state.customColors.textColor || '#000000'
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
          color: i % 2 === 0 ? state.customColors.primary : state.customColors.secondary,
          image: null,
          winProbability: 100 / state.segmentCount
        })),
        borderColor: state.customColors.secondary,
        borderOutlineColor: state.customColors.accent,
        segmentColor1: state.customColors.primary,
        segmentColor2: state.customColors.secondary,
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
            color: i % 2 === 0 ? state.customColors.primary : state.customColors.secondary,
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
            backgroundColor: state.customColors.primary,
            textColor: state.customColors.textColor || '#ffffff'
          })),
          timePerQuestion: 30,
          buttonLabel: 'Commencer le Quiz',
          buttonColor: state.customColors.accent,
          primaryColor: state.customColors.primary,
          secondaryColor: state.customColors.secondary
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
              backgroundColor: state.customColors.primary,
              textColor: state.customColors.textColor || '#ffffff'
            }
          ],
          buttonLabel: 'Gratter',
          winMessage: 'Bravo ! Vous avez gagné !',
          loseMessage: 'Pas de chance cette fois !',
          primaryColor: state.customColors.primary,
          secondaryColor: state.customColors.secondary
        }
      };
      break;

    default:
      break;
  }

  return baseConfig;
};

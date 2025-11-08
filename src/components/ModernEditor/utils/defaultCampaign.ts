
import { CampaignType, getDefaultGameConfig } from '../../../utils/campaignTypes';

const defaultFormFields = [
  {
    id: 'prenom',
    label: 'Prénom',
    type: 'text',
    required: true
  },
  {
    id: 'nom',
    label: 'Nom',
    type: 'text',
    required: true
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    required: true
  }
];

export const getDefaultCampaign = (campaignType: CampaignType, isNewCampaign: boolean) => ({
  id: undefined,
  name: isNewCampaign ? 'Nouvelle Campagne' : 'Ma Campagne',
  description: '',
  url: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '18:00',
  status: 'draft',
  type: campaignType,
  formFields: defaultFormFields,
  gameConfig: getDefaultGameConfig(campaignType),
  gameSize: 'medium' as 'small' | 'medium' | 'large' | 'xlarge',
  gamePosition: 'center' as 'top' | 'center' | 'bottom' | 'left' | 'right',
  buttonConfig: {
    color: '#E0004D',
    borderColor: '#E0004D',
    borderWidth: 1,
    borderRadius: 8,
    size: 'medium' as 'small' | 'medium' | 'large',
    link: '',
    visible: true,
    text: 'Remplir le formulaire'
  },
  design: {
    background: '#f8fafc',
    primaryColor: '#E0004D',
    secondaryColor: '#ffffff',
    titleColor: '#000000',
    buttonColor: '#E0004D',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    textStyles: {
      title: {
        fontFamily: 'Open Sans',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center' as const,
        color: '#000000',
        lineHeight: '1.2'
      },
      description: {
        fontFamily: 'Open Sans',
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left' as const,
        color: '#000000',
        lineHeight: '1.5'
      },
      label: {
        fontFamily: 'Open Sans',
        fontSize: '14px',
        fontWeight: 'normal',
        textAlign: 'left' as const,
        color: '#000000',
        lineHeight: '1.4'
      },
      button: {
        fontFamily: 'Open Sans',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center' as const,
        color: '#ffffff',
        lineHeight: '1.2'
      }
    },
    customText: {
      enabled: false,
      text: 'Texte personnalisé',
      position: 'top' as 'top' | 'bottom' | 'left' | 'right' | 'center',
      size: 'medium' as 'small' | 'medium' | 'large',
      color: '#000000',
      showFrame: false,
      frameColor: '#ffffff',
      frameBorderColor: '#e5e7eb'
    }
  },
  screens: {
    1: {
      title: isNewCampaign ? '' : 'Bienvenue !',
      description: isNewCampaign ? '' : 'Participez à notre jeu et tentez de gagner !',
      buttonText: 'Participer',
      showTitle: !isNewCampaign,
      showDescription: !isNewCampaign
    },
    3: {
      title: isNewCampaign ? '' : 'Félicitations !',
      description: isNewCampaign ? '' : 'Merci pour votre participation !',
      showTitle: !isNewCampaign,
      showDescription: !isNewCampaign
    }
  }
});

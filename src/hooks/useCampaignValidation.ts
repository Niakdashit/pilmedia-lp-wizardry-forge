import { useEditorStore } from '@/stores/editorStore';

export interface CampaignValidationError {
  field: string;
  message: string;
}

export interface CampaignValidationResult {
  isValid: boolean;
  errors: CampaignValidationError[];
}

/**
 * Hook pour valider les paramètres obligatoires d'une campagne
 * Vérifie : nom, dates de début/fin, heures de début/fin
 */
export const useCampaignValidation = () => {
  const campaign = useEditorStore((state) => state.campaign);

  const validateCampaign = (): CampaignValidationResult => {
    const errors: CampaignValidationError[] = [];

    // Vérifier le nom de la campagne
    if (!campaign?.name || campaign.name.trim() === '' || campaign.name === 'Nouvelle Roue de la Fortune') {
      errors.push({
        field: 'name',
        message: 'Le nom de la campagne est obligatoire'
      });
    }

    // Vérifier les dates et heures dans campaign_settings
    const settings = (campaign as any)?.campaign_settings;
    
    if (!settings) {
      errors.push({
        field: 'settings',
        message: 'Les paramètres de la campagne doivent être configurés'
      });
      return { isValid: false, errors };
    }

    // Vérifier la date de début
    if (!settings.start_date) {
      errors.push({
        field: 'start_date',
        message: 'La date de début est obligatoire'
      });
    }

    // Vérifier l'heure de début
    if (!settings.start_time) {
      errors.push({
        field: 'start_time',
        message: "L'heure de début est obligatoire"
      });
    }

    // Vérifier la date de fin
    if (!settings.end_date) {
      errors.push({
        field: 'end_date',
        message: 'La date de fin est obligatoire'
      });
    }

    // Vérifier l'heure de fin
    if (!settings.end_time) {
      errors.push({
        field: 'end_time',
        message: "L'heure de fin est obligatoire"
      });
    }

    // Vérifier que la date de fin est après la date de début
    if (settings.start_date && settings.end_date) {
      const startDate = new Date(settings.start_date);
      const endDate = new Date(settings.end_date);
      
      if (endDate < startDate) {
        errors.push({
          field: 'dates',
          message: 'La date de fin doit être après la date de début'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return { validateCampaign };
};

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
 * Validation spécifique selon le type de campagne (quiz, wheel, etc.)
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

    // Validation spécifique selon le type de campagne
    const campaignType = campaign?.type || (campaign as any)?.gameType;

    if (campaignType === 'quiz') {
      // Validation spécifique au QuizEditor
      const quizConfig = (campaign as any)?.design?.quizConfig || (campaign as any)?.config?.quizConfig;
      const modularPage = (campaign as any)?.design?.quizModules || (campaign as any)?.modularPage;

      // Vérifier que le quiz a des questions
      const questions = quizConfig?.questions || (campaign as any)?.gameConfig?.quiz?.questions;
      if (!questions || (Array.isArray(questions) && questions.length === 0)) {
        errors.push({
          field: 'quiz_questions',
          message: 'Au moins une question doit être configurée pour le quiz'
        });
      }

      // Vérifier que des modules sont présents
      if (modularPage && modularPage.screens) {
        const totalModules = Object.values(modularPage.screens).reduce((total: number, screenModules: any) => {
          return total + (Array.isArray(screenModules) ? screenModules.length : 0);
        }, 0);

        if (totalModules === 0) {
          errors.push({
            field: 'quiz_modules',
            message: 'Au moins un module doit être ajouté au quiz'
          });
        }
      }

      // Vérifier qu'il y a un bouton de participation
      const allModules = modularPage?.screens ? Object.values(modularPage.screens).flat() : [];
      const hasButton = allModules.some((module: any) => module.type === 'BlocBouton');

      if (!hasButton) {
        errors.push({
          field: 'quiz_button',
          message: 'Un bouton de participation est requis pour le quiz'
        });
      }

      // Vérifier les champs de formulaire
      const formFields = (campaign as any)?.formFields || (campaign as any)?.form_fields;
      if (!formFields || (Array.isArray(formFields) && formFields.length === 0)) {
        errors.push({
          field: 'form_fields',
          message: 'Au moins un champ de formulaire est requis'
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

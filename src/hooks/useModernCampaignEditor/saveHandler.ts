
import { useNavigate } from 'react-router-dom';

export const createSaveHandler = (
  campaign: any,
  saveCampaign: (data: any) => Promise<any>,
  navigate: ReturnType<typeof useNavigate>,
  setCampaign: React.Dispatch<React.SetStateAction<any>>
) => {
  return async (continueEditing = false) => {
    try {
      if (campaign.type === 'quiz') {
        const questions = campaign.gameConfig?.quiz?.questions || [];
        const valid = questions.every((q: any) =>
          Array.isArray(q.options) && q.options.length >= 2 && q.options.some((o: any) => o.isCorrect)
        );
        if (!valid) {
          alert('Chaque question doit comporter au moins deux options et une réponse correcte.');
          return;
        }
      }
      
      // Normalize form fields: remove placeholder keys to avoid persisting them
      const normalizedFormFields = Array.isArray(campaign.formFields)
        ? campaign.formFields.map((f: any) => {
            const { placeholder, ...rest } = f || {};
            return rest;
          })
        : campaign.formFields;

      const campaignData = {
        ...campaign,
        // Map camelCase to snake_case for DB compatibility
        game_config: (campaign as any).game_config || (campaign as any).gameConfig || {},
        config: (campaign as any).config || {},
        design: (campaign as any).design || {},
        form_fields: normalizedFormFields
      };
      
      console.log('Saving campaign with data:', campaignData);
      
      const savedCampaign = await saveCampaign(campaignData);
      if (savedCampaign && !continueEditing) {
        navigate('/gamification');
      } else if (savedCampaign) {
        setCampaign((prev: any) => ({
          ...prev,
          id: (savedCampaign as any).id
        }));
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  };
};

// Helper to persist the campaign to DB with proper mapping
export const saveCampaignToDB = async (
  campaign: any,
  saveCampaignFn: (data: any) => Promise<any>
) => {
  const normalizedFormFields = Array.isArray(campaign?.formFields)
    ? campaign.formFields.map((f: any) => {
        const { placeholder, ...rest } = f || {};
        return rest;
      })
    : campaign?.form_fields || [];

  const payload: any = {
    id: campaign?.id,
    name: campaign?.name || 'Nouvelle campagne',
    description: campaign?.description,
    slug: campaign?.slug,
    type: campaign?.type || 'wheel',
    status: campaign?.status || 'draft',
    config: campaign?.config || {},
    game_config: campaign?.game_config || campaign?.gameConfig || {},
    design: campaign?.design || {},
    form_fields: normalizedFormFields,
    start_date: campaign?.start_date,
    end_date: campaign?.end_date,
    thumbnail_url: campaign?.thumbnail_url,
    banner_url: campaign?.banner_url,
  };

  console.debug('[saveCampaignToDB] payload', payload);
  const saved = await saveCampaignFn(payload);
  return saved;
};

// Save and continue: persist then navigate to /campaign/:id/settings, with localStorage fallback
export const createSaveAndContinueHandler = (
  campaign: any,
  saveCampaign: (data: any) => Promise<any>,
  navigate: ReturnType<typeof useNavigate>,
  setCampaign: React.Dispatch<React.SetStateAction<any>>
) => {
  return async () => {
    try {
      const saved = await saveCampaignToDB(campaign, saveCampaign);
      let campaignId = saved?.id as string | undefined;

      if (!campaignId) {
        // Fallback to localStorage draft if DB not available
        campaignId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
          ? (crypto as any).randomUUID()
          : `draft-${Date.now()}`;
        try {
          const draft = { ...(campaign || {}), id: campaignId, _source: 'localStorage' };
          localStorage.setItem(`campaign:draft:${campaignId}`, JSON.stringify(draft));
          console.warn('[createSaveAndContinueHandler] Saved draft to localStorage due to DB failure');
        } catch (e) {
          console.error('Failed to persist draft locally', e);
        }
      }

      if (campaignId) {
        setCampaign((prev: any) => ({ ...prev, id: campaignId }));
        navigate(`/campaign/${campaignId}/settings`);
      }
    } catch (error) {
      console.error('Error in saveAndContinue:', error);
      throw error;
    }
  };
};

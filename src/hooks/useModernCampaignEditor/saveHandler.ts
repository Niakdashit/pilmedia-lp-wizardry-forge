
// import { useNavigate } from 'react-router-dom'; // Not used in Next.js

export const createSaveHandler = (
  campaign: any,
  saveCampaign: (data: any) => Promise<any>,
  navigate: (path: string) => void,
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
      
      // Use saveCampaignToDB to ensure proper data mapping
      const savedCampaign = await saveCampaignToDB(campaign, saveCampaign);
      
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
        const { placeholder, ...rest} = f || {};
        return rest;
      })
    : campaign?.form_fields || [];

  // Merge config with canvasConfig to preserve background images and elements
  const mergedConfig = (() => {
    const base = campaign?.config || {};
    const canvasCfg = (campaign as any)?.canvasConfig || (base as any)?.canvasConfig || {};
    
    // Preserve canvas elements and backgrounds
    const result = { ...base };
    if (canvasCfg && Object.keys(canvasCfg).length > 0) {
      result.canvasConfig = canvasCfg;
    }
    return result;
  })();

  // Merge design to preserve background images and other design properties
  const mergedDesign = {
    ...(campaign?.design || {}),
    // Preserve background images from both design and canvasConfig
    backgroundImage: campaign?.design?.backgroundImage || (campaign as any)?.canvasConfig?.background?.value,
    mobileBackgroundImage: campaign?.design?.mobileBackgroundImage || (campaign as any)?.canvasConfig?.mobileBackground?.value,
    // For compatibility, also save background image in the 'background' field if it's an image
    background: campaign?.design?.background || 
      (campaign?.design?.backgroundImage || (campaign as any)?.canvasConfig?.background?.value) ||
      campaign?.design?.backgroundImage,
    // Preserve screenBackgrounds for multi-screen campaigns
    screenBackgrounds: campaign?.design?.screenBackgrounds,
  };

  const payload: any = {
    id: campaign?.id,
    name: campaign?.name || 'Nouvelle campagne',
    description: campaign?.description,
    slug: campaign?.slug,
    type: campaign?.type || 'wheel',
    status: campaign?.status || 'draft',
    config: mergedConfig,
    game_config: campaign?.game_config || campaign?.gameConfig || {},
    design: mergedDesign,
    form_fields: normalizedFormFields,
    start_date: campaign?.start_date,
    end_date: campaign?.end_date,
    thumbnail_url: campaign?.thumbnail_url,
    banner_url: campaign?.banner_url,
  };

  console.debug('[saveCampaignToDB] payload with background images:', {
    ...payload,
    design: {
      ...payload.design,
      backgroundImage: payload.design?.backgroundImage,
      mobileBackgroundImage: payload.design?.mobileBackgroundImage
    }
  });
  const saved = await saveCampaignFn(payload);
  console.debug('[saveCampaignToDB] saved result:', saved);
  return saved;
};

// Save and continue: persist then navigate to /campaign/:id/settings, with localStorage fallback
export const createSaveAndContinueHandler = (
  campaign: any,
  saveCampaign: (data: any) => Promise<any>,
  navigate: (path: string) => void,
  setCampaign: React.Dispatch<React.SetStateAction<any>>
) => {
  return async () => {
    try {
      const saved = await saveCampaignToDB(campaign, saveCampaign);
      let campaignId = saved?.id as string | undefined;

      if (!campaignId) {
        throw new Error('Impossible de sauvegarder la campagne');
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

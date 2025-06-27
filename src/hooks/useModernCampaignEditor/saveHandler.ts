
import { useNavigate } from 'react-router-dom';

export const createSaveHandler = (
  campaign: any,
  saveCampaign: (data: any) => Promise<any>,
  navigate: ReturnType<typeof useNavigate>,
  isNewCampaign: boolean,
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
          return null;
        }
      }
      
      const campaignData = {
        ...campaign,
        form_fields: campaign.formFields
      };
      
      console.log('Saving campaign with data:', campaignData);
      
      const savedCampaign = await saveCampaign(campaignData);
      
      if (savedCampaign && !continueEditing) {
        navigate('/gamification');
      } else if (savedCampaign && isNewCampaign) {
        setCampaign((prev: any) => ({
          ...prev,
          id: savedCampaign.id
        }));
      }
      
      return savedCampaign;
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  };
};


import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CampaignType } from '../utils/campaignTypes';
import { useCampaigns } from './useCampaigns';
import { getDefaultCampaign } from '../components/ModernEditor/utils/defaultCampaign';

export const useModernCampaignEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNewCampaign = id === 'new';
  const campaignType = searchParams.get('type') as CampaignType || 'wheel';
  
  const [activeTab, setActiveTab] = useState('general');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  
  const { saveCampaign, getCampaign } = useCampaigns();
  
  const [campaign, setCampaign] = useState<any>(getDefaultCampaign(campaignType, isNewCampaign));

  useEffect(() => {
    if (!isNewCampaign && id) {
      loadCampaign(id);
    }
  }, [id, isNewCampaign]);

  const loadCampaign = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const existingCampaign = await getCampaign(campaignId);
      if (existingCampaign) {
        console.log('Loaded campaign from QuickCampaign:', existingCampaign);
        
        // Fusionner les données de QuickCampaign avec la structure par défaut
        const mergedCampaign = {
          ...getDefaultCampaign(existingCampaign.type || campaignType, false),
          ...existingCampaign,
          // S'assurer que les formFields sont correctement mappés
          formFields: existingCampaign.form_fields || existingCampaign.formFields || getDefaultCampaign(campaignType, isNewCampaign).formFields,
          // Préserver la configuration du design
          design: {
            ...getDefaultCampaign(existingCampaign.type || campaignType, false).design,
            ...existingCampaign.design
          },
          // Préserver la configuration des jeux
          gameConfig: {
            ...getDefaultCampaign(existingCampaign.type || campaignType, false).gameConfig,
            ...existingCampaign.gameConfig
          },
          // Préserver la configuration des boutons
          buttonConfig: {
            ...getDefaultCampaign(existingCampaign.type || campaignType, false).buttonConfig,
            ...existingCampaign.buttonConfig
          },
          // Préserver les écrans
          screens: {
            ...getDefaultCampaign(existingCampaign.type || campaignType, false).screens,
            ...existingCampaign.screens
          }
        };
        
        console.log('Merged campaign data:', mergedCampaign);
        setCampaign(mergedCampaign);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (continueEditing = false) => {
    setIsLoading(true);
    try {
      // Quiz validation
      if (campaign.type === 'quiz') {
        const questions = campaign.gameConfig?.quiz?.questions || [];
        const valid = questions.every((q: any) =>
          Array.isArray(q.options) && q.options.length >= 2 && q.options.some((o: any) => o.isCorrect)
        );
        if (!valid) {
          alert('Chaque question doit comporter au moins deux options et une réponse correcte.');
          setIsLoading(false);
          return;
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
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    campaign,
    setCampaign,
    activeTab,
    setActiveTab,
    showPreviewModal,
    setShowPreviewModal,
    previewDevice,
    setPreviewDevice,
    isLoading,
    campaignType,
    isNewCampaign,
    handleSave
  };
};

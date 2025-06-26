
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
      console.log('Loading campaign with ID:', campaignId);
      
      // For QuickCampaign preview, we need to handle the mock data differently
      if (campaignId === 'quick-preview') {
        // Try to get the campaign from localStorage or another source
        const quickCampaignData = localStorage.getItem('quickCampaignPreview');
        if (quickCampaignData) {
          const parsedData = JSON.parse(quickCampaignData);
          console.log('Loaded QuickCampaign data from localStorage:', parsedData);
          
          const existingCampaignType = (parsedData.type as CampaignType) || campaignType;
          
          // Create comprehensive merged campaign
          const mergedCampaign = {
            ...getDefaultCampaign(existingCampaignType, false),
            ...parsedData,
            // Ensure proper field mapping
            formFields: parsedData.form_fields || parsedData.formFields || getDefaultCampaign(existingCampaignType, false).formFields,
            // Ensure design configuration is preserved
            design: {
              ...getDefaultCampaign(existingCampaignType, false).design,
              ...parsedData.design,
              // Map QuickCampaign colors to ModernEditor format
              primaryColor: parsedData.customColors?.primary || parsedData.design?.primaryColor,
              secondaryColor: parsedData.customColors?.secondary || parsedData.design?.secondaryColor,
              accentColor: parsedData.customColors?.accent || parsedData.design?.accentColor,
              textPrimaryColor: parsedData.customColors?.textColor || parsedData.design?.textPrimaryColor,
              centerLogo: parsedData.logoUrl || parsedData.design?.centerLogo,
              backgroundImage: parsedData.backgroundImageUrl || parsedData.design?.backgroundImage,
              customColors: parsedData.customColors || {}
            },
            // Ensure game configuration is preserved
            gameConfig: {
              ...getDefaultCampaign(existingCampaignType, false).gameConfig,
              ...parsedData.gameConfig,
              // Special handling for wheel configuration
              wheel: parsedData.config?.roulette ? {
                ...parsedData.config.roulette,
                segments: parsedData.config.roulette.segments || []
              } : parsedData.gameConfig?.wheel
            },
            // Ensure button configuration is preserved
            buttonConfig: {
              ...getDefaultCampaign(existingCampaignType, false).buttonConfig,
              ...parsedData.buttonConfig
            },
            // Ensure screens configuration is preserved
            screens: {
              ...getDefaultCampaign(existingCampaignType, false).screens,
              ...parsedData.screens
            }
          };
          
          console.log('Final merged campaign:', mergedCampaign);
          setCampaign(mergedCampaign);
          return;
        }
      }

      const existingCampaign = await getCampaign(campaignId);
      if (existingCampaign) {
        console.log('Loaded campaign from API:', existingCampaign);
        
        const existingCampaignType = (existingCampaign.type as CampaignType) || campaignType;
        
        const mergedCampaign = {
          ...getDefaultCampaign(existingCampaignType, false),
          ...existingCampaign,
          formFields: existingCampaign.form_fields || existingCampaign.formFields || getDefaultCampaign(existingCampaignType, false).formFields,
          design: {
            ...getDefaultCampaign(existingCampaignType, false).design,
            ...existingCampaign.design
          },
          gameConfig: {
            ...getDefaultCampaign(existingCampaignType, false).gameConfig,
            ...existingCampaign.gameConfig
          },
          buttonConfig: {
            ...getDefaultCampaign(existingCampaignType, false).buttonConfig,
            ...existingCampaign.buttonConfig
          },
          screens: {
            ...getDefaultCampaign(existingCampaignType, false).screens,
            ...existingCampaign.screens
          }
        };
        
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

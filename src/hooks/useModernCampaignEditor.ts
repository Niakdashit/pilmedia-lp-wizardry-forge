
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CampaignType } from '../utils/campaignTypes';
import { useCampaigns } from './useCampaigns';
import { getDefaultCampaign } from '../components/ModernEditor/utils/defaultCampaign';

// Helper function to validate and sanitize colors
const validateColors = (colors: any) => {
  const defaultColors = {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#0ea5e9',
    textColor: '#000000'
  };

  if (!colors || typeof colors !== 'object') {
    console.warn('Invalid colors object, using defaults:', colors);
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

// Helper function to validate QuickCampaign data
const validateQuickCampaignData = (data: any) => {
  console.log('Validating QuickCampaign data:', data);
  
  if (!data || typeof data !== 'object') {
    console.error('Invalid QuickCampaign data structure');
    return null;
  }

  // Validate essential properties
  if (!data.name && !data.campaignName) {
    console.error('Missing campaign name in QuickCampaign data');
    return null;
  }

  if (!data.type && !data.selectedGameType) {
    console.error('Missing game type in QuickCampaign data');
    return null;
  }

  return {
    ...data,
    name: data.name || data.campaignName,
    type: data.type || data.selectedGameType,
    customColors: validateColors(data.customColors || data.design?.customColors)
  };
};

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
  
  const [campaign, setCampaign] = useState<any>(() => {
    console.log('Initializing campaign with campaignType:', campaignType);
    return getDefaultCampaign(campaignType, isNewCampaign);
  });

  useEffect(() => {
    console.log('useEffect triggered with id:', id, 'isNewCampaign:', isNewCampaign);
    
    if (!isNewCampaign && id) {
      loadCampaign(id);
    }
  }, [id, isNewCampaign]);

  const loadCampaign = async (campaignId: string) => {
    console.log('Loading campaign with ID:', campaignId);
    setIsLoading(true);
    
    try {
      if (campaignId === 'quick-preview') {
        console.log('Loading QuickCampaign preview data');
        
        const quickCampaignData = localStorage.getItem('quickCampaignPreview');
        console.log('QuickCampaign data from localStorage:', quickCampaignData);
        
        if (quickCampaignData) {
          const parsedData = JSON.parse(quickCampaignData);
          console.log('Parsed QuickCampaign data:', parsedData);
          
          const validatedData = validateQuickCampaignData(parsedData);
          if (!validatedData) {
            console.error('QuickCampaign data validation failed');
            setIsLoading(false);
            return;
          }
          
          const existingCampaignType = (validatedData.type as CampaignType) || campaignType;
          console.log('Using campaign type:', existingCampaignType);
          
          const defaultCampaign = getDefaultCampaign(existingCampaignType, false);
          console.log('Default campaign:', defaultCampaign);
          
          const mergedCampaign = {
            ...defaultCampaign,
            ...validatedData,
            formFields: validatedData.form_fields || validatedData.formFields || defaultCampaign.formFields,
            design: {
              ...defaultCampaign.design,
              ...validatedData.design,
              primaryColor: validatedData.customColors?.primary || validatedData.design?.primaryColor || defaultCampaign.design.primaryColor,
              secondaryColor: validatedData.customColors?.secondary || validatedData.design?.secondaryColor || defaultCampaign.design.secondaryColor,
              accentColor: validatedData.customColors?.accent || validatedData.design?.accentColor || validatedData.customColors?.primary || defaultCampaign.design.primaryColor,
              textColor: validatedData.customColors?.textColor || validatedData.design?.textColor || defaultCampaign.design.textColor || '#000000',
              centerLogo: validatedData.logoUrl || validatedData.design?.centerLogo,
              backgroundImage: validatedData.backgroundImageUrl || validatedData.design?.backgroundImage,
              customColors: validatedData.customColors || {}
            },
            gameConfig: {
              ...defaultCampaign.gameConfig,
              ...validatedData.gameConfig,
              // Handle wheel configuration specifically
              ...(existingCampaignType === 'wheel' && validatedData.config?.roulette ? {
                wheel: {
                  ...defaultCampaign.gameConfig?.wheel,
                  ...validatedData.config.roulette,
                  segments: Array.isArray(validatedData.config.roulette.segments) 
                    ? validatedData.config.roulette.segments 
                    : defaultCampaign.gameConfig?.wheel?.segments || []
                }
              } : {})
            },
            buttonConfig: {
              ...defaultCampaign.buttonConfig,
              ...validatedData.buttonConfig,
              color: validatedData.customColors?.accent || validatedData.buttonConfig?.color || defaultCampaign.buttonConfig?.color,
              backgroundColor: validatedData.customColors?.accent || validatedData.buttonConfig?.backgroundColor || defaultCampaign.buttonConfig?.color || '#3b82f6'
            },
            screens: {
              ...defaultCampaign.screens,
              ...validatedData.screens
            }
          };
          
          console.log('Final merged campaign:', mergedCampaign);
          setCampaign(mergedCampaign);
          setIsLoading(false);
          return;
        } else {
          console.log('No QuickCampaign data found in localStorage');
        }
      }

      console.log('Loading standard campaign from API');
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
            ...existingCampaign.design,
            customColors: validateColors(existingCampaign.design?.customColors)
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
        
        console.log('Merged standard campaign:', mergedCampaign);
        setCampaign(mergedCampaign);
      } else {
        console.log('No campaign found, using default');
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

  console.log('Current campaign state:', campaign);

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

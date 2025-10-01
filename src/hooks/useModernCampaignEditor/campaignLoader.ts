
import { CampaignType } from '../../utils/campaignTypes';
import { getDefaultCampaign } from '../../components/ModernEditor/utils/defaultCampaign';
import { validateQuickCampaignData, validateColors } from './validationUtils';

export const loadCampaign = async (
  campaignId: string,
  campaignType: CampaignType,
  getCampaign: (id: string) => Promise<any>
) => {
  console.log('Loading campaign with ID:', campaignId);
  
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
          console.error('QuickCampaign data validation failed, using default campaign');
          return getDefaultCampaign(campaignType, false);
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
            backgroundImage: validatedData.backgroundImageUrl || validatedData.design?.backgroundImage,
            customColors: validatedData.customColors || {}
          },
          gameConfig: {
            ...defaultCampaign.gameConfig,
            ...validatedData.gameConfig,
            // Handle wheel configuration specifically
            ...(existingCampaignType === 'wheel' && validatedData.config?.roulette ? {
              wheel: {
                ...validatedData.config.roulette,
                segments: Array.isArray(validatedData.config.roulette.segments) 
                  ? validatedData.config.roulette.segments 
                  : []
              }
            } : {})
          },
          buttonConfig: {
            ...defaultCampaign.buttonConfig,
            ...validatedData.buttonConfig,
            color: validatedData.customColors?.accent || validatedData.buttonConfig?.color || defaultCampaign.buttonConfig?.color,
            backgroundColor: validatedData.customColors?.accent || validatedData.buttonConfig?.backgroundColor || defaultCampaign.buttonConfig?.color || '#d4dbe8'
          },
          screens: {
            ...defaultCampaign.screens,
            ...validatedData.screens
          }
        };
        
        console.log('Final merged campaign:', mergedCampaign);
        return mergedCampaign;
      } else {
        console.log('No QuickCampaign data found in localStorage, using default campaign');
        return getDefaultCampaign(campaignType, false);
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
      return mergedCampaign;
    } else {
      console.log('No campaign found, using default');
      return null;
    }
  } catch (error) {
    console.error('Error loading campaign:', error);
    throw error;
  }
};

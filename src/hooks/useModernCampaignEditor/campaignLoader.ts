
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
            backgroundColor: validatedData.customColors?.accent || validatedData.buttonConfig?.backgroundColor || defaultCampaign.buttonConfig?.color || '#841b60'
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
      console.log('✅ [campaignLoader] Loaded campaign from DB:', {
        id: existingCampaign.id,
        name: existingCampaign.name,
        type: existingCampaign.type,
        hasDesign: !!existingCampaign.design,
        hasConfig: !!existingCampaign.config,
        hasGameConfig: !!existingCampaign.game_config,
        designKeys: Object.keys(existingCampaign.design || {}),
        configKeys: Object.keys(existingCampaign.config || {})
      });
      
      const existingCampaignType = (existingCampaign.type as CampaignType) || campaignType;
      const defaultCampaign = getDefaultCampaign(existingCampaignType, false);
      
      // Restore complete canvasConfig with all editor states
      const canvasConfig = existingCampaign.config?.canvasConfig || {};
      const canvasElements = canvasConfig.elements || [];
      const screenBackgrounds = canvasConfig.screenBackgrounds || existingCampaign.design?.screenBackgrounds || {};
      
      // Restore modularPage structure
      const modularPage = existingCampaign.config?.modularPage || existingCampaign.design?.designModules || {
        screens: { screen1: [], screen2: [], screen3: [] },
        _updatedAt: Date.now()
      };
      
      // Restore extracted colors
      const extractedColors = existingCampaign.design?.extractedColors || [];
      
      // Build comprehensive restored campaign
      const mergedCampaign = {
        ...defaultCampaign,
        ...existingCampaign,
        
        // Restore canvas configuration
        canvasConfig,
        canvasElements,
        screenBackgrounds,
        modularPage,
        extractedColors,
        
        // Restore button and screen configs
        buttonConfig: {
          ...defaultCampaign.buttonConfig,
          ...(existingCampaign.config?.buttonConfig || existingCampaign.buttonConfig || {})
        },
        screens: {
          ...defaultCampaign.screens,
          ...(existingCampaign.config?.screens || existingCampaign.screens || {})
        },
        campaignConfig: existingCampaign.config?.campaignConfig || {},
        
        // Restore form fields
        formFields: existingCampaign.form_fields || existingCampaign.formFields || defaultCampaign.formFields,
        
        // Restore complete design object
        design: {
          ...defaultCampaign.design,
          ...existingCampaign.design,
          
          // Background images (priority: design > canvasConfig)
          backgroundImage: existingCampaign.design?.backgroundImage 
            || (canvasConfig.background?.type === 'image' ? canvasConfig.background.value : undefined)
            || existingCampaign.design?.background,
          mobileBackgroundImage: existingCampaign.design?.mobileBackgroundImage
            || (canvasConfig.mobileBackground?.type === 'image' ? canvasConfig.mobileBackground.value : undefined),
          
          // Preserve all design properties
          background: existingCampaign.design?.background,
          customColors: validateColors(existingCampaign.design?.customColors),
          extractedColors,
          screenBackgrounds,
          designModules: modularPage,
          customTexts: existingCampaign.design?.customTexts || [],
          customImages: existingCampaign.design?.customImages || [],
          borderStyle: existingCampaign.design?.borderStyle,
          wheelBorderStyle: existingCampaign.design?.wheelBorderStyle
        },
        
        // Restore complete game configuration
        gameConfig: {
          ...defaultCampaign.gameConfig,
          ...(existingCampaign.game_config || existingCampaign.gameConfig || {}),
          
          // Type-specific game configs
          ...(existingCampaignType === 'wheel' && existingCampaign.game_config?.wheel ? { wheel: existingCampaign.game_config.wheel } : {}),
          ...(existingCampaignType === 'quiz' && existingCampaign.game_config?.quiz ? { quiz: existingCampaign.game_config.quiz } : {}),
          ...(existingCampaignType === 'scratch' && existingCampaign.game_config?.scratch ? { scratch: existingCampaign.game_config.scratch } : {}),
          ...(existingCampaignType === 'jackpot' && existingCampaign.game_config?.jackpot ? { jackpot: existingCampaign.game_config.jackpot } : {})
        }
      };
      
      console.log('✅ [campaignLoader] Complete restored campaign:', {
        id: mergedCampaign.id,
        name: mergedCampaign.name,
        type: mergedCampaign.type,
        hasBackgroundImage: !!mergedCampaign.design?.backgroundImage,
        hasMobileBackgroundImage: !!mergedCampaign.design?.mobileBackgroundImage,
        hasDesignModules: !!mergedCampaign.design?.designModules,
        canvasElementsCount: mergedCampaign.canvasElements?.length || 0,
        modularPageScreens: Object.keys(mergedCampaign.modularPage?.screens || {}).length,
        screenBackgroundsCount: Object.keys(mergedCampaign.screenBackgrounds || {}).length,
        formFieldsCount: mergedCampaign.formFields?.length || 0,
        extractedColorsCount: mergedCampaign.extractedColors?.length || 0
      });
      
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

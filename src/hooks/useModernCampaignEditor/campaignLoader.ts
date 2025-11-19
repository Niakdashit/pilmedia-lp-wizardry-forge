import { CampaignType } from '../../utils/campaignTypes';
import { getDefaultCampaign } from '../../components/ModernEditor/utils/defaultCampaign';
import { validateQuickCampaignData, validateColors } from './validationUtils';

// Cache optimisé pour chargement instantané
const campaignCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Précharge une image avec retry
const preloadImage = (url: string, retries = 2): Promise<void> => {
  return new Promise((resolve) => {
    const attempt = (retriesLeft: number) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        if (retriesLeft > 0) {
          setTimeout(() => attempt(retriesLeft - 1), 500);
        } else {
          resolve(); // Continue même en cas d'erreur
        }
      };
      img.src = url;
    };
    attempt(retries);
  });
};

// Extrait et précharge toutes les images de la campagne
const preloadCampaignImages = async (campaign: any): Promise<void> => {
  const urls: string[] = [];
  
  try {
    // Images de fond
    if (campaign.design?.backgroundImage) urls.push(campaign.design.backgroundImage);
    if (campaign.design?.mobileBackgroundImage) urls.push(campaign.design.mobileBackgroundImage);
    
    // Backgrounds par écran
    if (campaign.backgrounds || campaign.screenBackgrounds) {
      const backgrounds = campaign.backgrounds || campaign.screenBackgrounds;
      Object.values(backgrounds).forEach((screenBg: any) => {
        if (screenBg) {
          ['desktop', 'tablet', 'mobile'].forEach(device => {
            const deviceBg = screenBg[device];
            if (deviceBg?.backgroundImage?.url) urls.push(deviceBg.backgroundImage.url);
          });
        }
      });
    }
    
    // Images des modules
    if (campaign.modularPage?.screens) {
      Object.values(campaign.modularPage.screens).forEach((modules: any) => {
        modules?.forEach((module: any) => {
          if (module.type === 'image' && module.src) urls.push(module.src);
          if (module.image?.url) urls.push(module.image.url);
          if (module.backgroundImage?.url) urls.push(module.backgroundImage.url);
        });
      });
    }
    
    // Logo et assets
    if (campaign.design?.centerLogo) urls.push(campaign.design.centerLogo);
    if (campaign.articleConfig?.bannerImage) urls.push(campaign.articleConfig.bannerImage);
    if (campaign.articleConfig?.logoImage) urls.push(campaign.articleConfig.logoImage);
    
    // Précharge en parallèle (batch de 8)
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    const batchSize = 8;
    for (let i = 0; i < uniqueUrls.length; i += batchSize) {
      const batch = uniqueUrls.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(url => preloadImage(url)));
    }
  } catch (error) {
    console.warn('⚠️ Error preloading images:', error);
  }
};

// Fonction de chargement avec cache et retry
export const loadCampaign = async (
  campaignId: string,
  campaignType: CampaignType,
  getCampaign: (id: string) => Promise<any>,
  retries = 2
): Promise<any> => {
  console.log('🔄 Loading campaign with ID:', campaignId);
  
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
            backgroundColor: validatedData.customColors?.accent || validatedData.buttonConfig?.backgroundColor || defaultCampaign.buttonConfig?.color || '#44444d'
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

    // 1. Vérifier le cache d'abord (chargement instantané)
    const cached = campaignCache.get(campaignId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('⚡ [campaignLoader] Loading from cache (instant)');
      // Précharger les images en arrière-plan
      preloadCampaignImages(cached.data).catch(console.warn);
      return cached.data;
    }
    
    console.log('🌐 [campaignLoader] Loading campaign from API:', campaignId);
    
    // 2. Charger depuis Supabase avec retry
    let existingCampaign: any = null;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        existingCampaign = await getCampaign(campaignId);
        
        if (existingCampaign) {
          console.log('📥 [campaignLoader] Campaign loaded from DB:', {
            id: existingCampaign.id,
            name: existingCampaign.name,
            revision: existingCampaign.revision,
            hasConfig: !!existingCampaign.config,
            hasDesign: !!existingCampaign.design,
            hasGameConfig: !!existingCampaign.game_config
          });
        }
        
        break; // Succès, sortir de la boucle
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ [campaignLoader] Attempt ${attempt + 1}/${retries + 1} failed:`, error);
        if (attempt < retries) {
          console.warn(`⏳ [campaignLoader] Retrying in ${(attempt + 1) * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    if (!existingCampaign) {
      console.error('❌ [campaignLoader] Failed to load campaign after all retries');
      if (lastError) throw lastError;
      return null;
    }
    
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
      const canvasElements = (canvasConfig.elements && Array.isArray(canvasConfig.elements) && canvasConfig.elements.length > 0)
        ? canvasConfig.elements
        : (Array.isArray((existingCampaign.config as any)?.elements) ? (existingCampaign.config as any).elements : []);
      const screenBackgrounds = canvasConfig.screenBackgrounds || existingCampaign.design?.screenBackgrounds || {};
      
      // Restore modularPage structure - UNIFIED PRIORITY: config.modularPage (latest from store) > design.quizModules (fallback)
      const modularPage = existingCampaign.config?.modularPage || existingCampaign.design?.quizModules || existingCampaign.design?.designModules || {
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
        
        // Restore date/time fields from config or DB columns
        startDate: existingCampaign.config?.startDate || existingCampaign.start_date || existingCampaign.startDate,
        endDate: existingCampaign.config?.endDate || existingCampaign.end_date || existingCampaign.endDate,
        startTime: existingCampaign.config?.startTime || existingCampaign.startTime || '09:00',
        endTime: existingCampaign.config?.endTime || existingCampaign.endTime || '18:00',
        isActive: existingCampaign.config?.isActive !== false, // Default to true
        
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
          quizModules: modularPage, // For QuizEditor compatibility
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
        },
        
        // 🎯 CRITICAL: Restore wheel configuration (segments + layout options like position)
        wheelConfig: {
          ...(existingCampaign.game_config?.wheel || existingCampaign.wheelConfig || {
            segments: existingCampaign.game_config?.wheelSegments || []
          }),
          // ✅ Ensure we also restore layout options stored in design.wheelConfig (eg. position, showBulbs)
          ...(existingCampaign.design?.wheelConfig || {})
        },
        
        // 🎰 CRITICAL: Restore jackpot configuration (symbols, prize mappings)
        // This ensures symbol-prize assignments are restored
        jackpotConfig: existingCampaign.game_config?.jackpot || existingCampaign.jackpotConfig || {},
        
        // 🎁 CRITICAL: Restore prizes configuration (dotation system)
        // This ensures prize data, calendar dates, and awarded units are restored
        prizes: existingCampaign.game_config?.prizes || existingCampaign.prizes || []
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
      
      // Mettre en cache pour les prochains chargements
      campaignCache.set(campaignId, {
        data: mergedCampaign,
        timestamp: Date.now()
      });
      
      // Précharger les images en arrière-plan
      preloadCampaignImages(mergedCampaign).catch(console.warn);
      
      return mergedCampaign;
    } else {
      console.log('No campaign found, using default');
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading campaign:', error);
    
    // Essayer de retourner une version cachée expirée plutôt que rien
    const cached = campaignCache.get(campaignId);
    if (cached) {
      console.warn('⚠️ Using expired cache as fallback');
      return cached.data;
    }
    
    throw error;
  }
};

// Fonction pour invalider le cache (utile après une sauvegarde)
export const invalidateCampaignCache = (campaignId?: string) => {
  if (campaignId) {
    campaignCache.delete(campaignId);
  } else {
    campaignCache.clear();
  }
};

// Fonction pour mettre à jour le cache manuellement
export const updateCampaignCache = (campaignId: string, data: any) => {
  campaignCache.set(campaignId, {
    data,
    timestamp: Date.now()
  });
};

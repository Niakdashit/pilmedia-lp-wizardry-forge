import { extractAllCampaignImages } from '@/utils/extractImagesFromModules';

// Global save lock to prevent concurrent saves creating duplicates
const activeSaves = new Set<string>();

const acquireSaveLock = (campaignId: string): boolean => {
  if (activeSaves.has(campaignId)) {
    console.warn('⚠️ [SaveHandler] Save already in progress for campaign:', campaignId);
    return false;
  }
  activeSaves.add(campaignId);
  console.log('🔒 [SaveHandler] Acquired save lock for:', campaignId);
  return true;
};

const releaseSaveLock = (campaignId: string) => {
  activeSaves.delete(campaignId);
  console.log('🔓 [SaveHandler] Released save lock for:', campaignId);
};

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
  const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  
  // Generate campaign identifier for lock
  const campaignIdentifier = campaign?.id || `new-${campaign?.type || 'campaign'}-${campaign?.name || 'unnamed'}`;
  
  // 🔒 CRITICAL: Prevent concurrent saves creating duplicates
  if (!acquireSaveLock(campaignIdentifier)) {
    console.warn('⚠️ [saveCampaignToDB] Duplicate save prevented for:', campaignIdentifier);
    return campaign; // Return existing campaign without saving
  }
  
  try {
    // Skip saving for brand-new unnamed campaigns unless explicitly allowed later
    const idStr: string | undefined = campaign?.id;
    const isTempId = typeof idStr === 'string' && idStr.startsWith('temp-');
    const rawName = (campaign?.name ?? '').toString().trim();
    const isUnnamed = !rawName || /^(nouvelle campagne|ma campagne|new campaign|untitled)/i.test(rawName);
    const modularScreens = (campaign?.modularPage?.screens) || {};
    const hasModules = ['screen1','screen2','screen3'].some((s) => Array.isArray(modularScreens?.[s]) && modularScreens[s].length > 0);
    const hasElements = Array.isArray(campaign?.canvasElements) && campaign.canvasElements.length > 0;
    const bg = (campaign as any)?.canvasConfig?.background;
    const hasBg = !!(((bg && bg.type === 'image' && bg.value) ? bg.value : undefined)
      || (campaign as any)?.design?.backgroundImage
      || (campaign as any)?.design?.mobileBackgroundImage);
    const hasAnyContent = hasModules || hasElements || hasBg;

    // HARD GUARD A: never insert a new campaign when it's a fresh, unnamed draft with no content
    // Remove dependency on isNewCampaignGlobal because it may be cleared before unmount
    if (!isUuid(idStr) && (isTempId || !idStr) && isUnnamed && !hasAnyContent) {
      console.warn('⛔ [saveCampaignToDB] Skipping save for untouched, unnamed new campaign (no modules/elements/background)');
      return { ...campaign };
    }

    // HARD GUARD B: require a non-default name for any first insert
    // If the campaign is not yet persisted (no UUID), do not INSERT when the name is empty/default
    if (!isUuid(idStr) && (isTempId || !idStr) && isUnnamed) {
      console.warn('⛔ [saveCampaignToDB] Skipping INSERT for unnamed campaign (name is empty or default)');
      return { ...campaign };
    }

    // HARD GUARD C: explicit opt-in for first INSERTs to prevent any auto-insert
    // Only allow INSERT when an explicit user action sets _allowFirstInsert = true
    if (!isUuid(idStr) && (isTempId || !idStr)) {
      const allow = (campaign as any)?._allowFirstInsert === true;
      if (!allow) {
        console.warn('⛔ [saveCampaignToDB] Skipping first INSERT (explicit opt-in missing: _allowFirstInsert=true)');
        return { ...campaign };
      }
    }

    // Hard guard: never persist preview-only campaign objects
    if (typeof campaign?.id === 'string' && !isUuid(campaign.id)) {
      if (campaign.id.includes('preview')) {
        console.warn('⛔ [saveCampaignToDB] Skipping save for preview-only campaign id:', campaign.id);
        return { ...campaign };
      }
    }
    console.log('💾 [saveCampaignToDB] Saving campaign with complete state:', {
    id: campaign?.id,
    name: campaign?.name,
    type: campaign?.type,
    hasCanvasElements: !!campaign?.canvasElements,
    hasModularPage: !!campaign?.modularPage,
    hasScreenBackgrounds: !!campaign?.screenBackgrounds,
    hasExtractedColors: !!campaign?.extractedColors
  });

  // Normalize form fields
  const normalizedFormFields = Array.isArray(campaign?.formFields)
    ? campaign.formFields.map((f: any) => {
        const { placeholder, ...rest} = f || {};
        return rest;
      })
    : campaign?.form_fields || [];

  // Build comprehensive canvasConfig with ALL editor states
  const canvasConfig = {
    // Preserve existing canvasConfig
    ...(campaign?.config?.canvasConfig || {}),
    ...(campaign?.canvasConfig || {}),
    
    // Canvas elements (éléments dessinés sur le canvas)
    elements: campaign?.canvasElements || campaign?.canvasConfig?.elements || [],
    
    // Background configuration
    background: campaign?.canvasConfig?.background || 
      (campaign?.design?.backgroundImage ? { type: 'image', value: campaign.design.backgroundImage } : undefined),
    mobileBackground: campaign?.canvasConfig?.mobileBackground ||
      (campaign?.design?.mobileBackgroundImage ? { type: 'image', value: campaign.design.mobileBackgroundImage } : undefined),
    
    // Screen-specific backgrounds
    screenBackgrounds: campaign?.screenBackgrounds 
      || campaign?.design?.screenBackgrounds 
      || campaign?.canvasConfig?.screenBackgrounds 
      || campaign?.config?.canvasConfig?.screenBackgrounds 
      || {},
    
    // Current device and zoom state
    device: campaign?.selectedDevice || 'desktop',
    zoom: campaign?.canvasZoom
  };

  // Build comprehensive config with modularPage and all editor data
  const mergedConfig = {
    ...(campaign?.config || {}),
    
    // Canvas configuration (elements, backgrounds, etc.)
    canvasConfig,
    
    // Duplicate elements at top-level config for compatibility with older loaders
    elements: (campaign?.canvasElements || campaign?.canvasConfig?.elements || campaign?.config?.elements || []),
    
    // Modular page structure (modules par écran) - CRITICAL: prioritize direct modularPage as it's synced from store
    modularPage: campaign?.modularPage || campaign?.config?.modularPage || campaign?.design?.quizModules || {
      screens: { screen1: [], screen2: [], screen3: [] },
      _updatedAt: Date.now()
    },
    
    // Campaign-specific settings
    campaignConfig: campaign?.campaignConfig || campaign?.config?.campaignConfig || {},
    
    // Button configuration
    buttonConfig: campaign?.buttonConfig || campaign?.config?.buttonConfig || {},
    
    // Screen configuration
    screens: campaign?.screens || campaign?.config?.screens || {}
  };

  // Build comprehensive design object
  const mergedDesign = {
    ...(campaign?.design || {}),
    
    // Background images (prioritize explicit design values)
    backgroundImage: campaign?.design?.backgroundImage || 
      (campaign?.canvasConfig?.background?.type === 'image' ? campaign.canvasConfig.background.value : undefined),
    mobileBackgroundImage: campaign?.design?.mobileBackgroundImage || 
      (campaign?.canvasConfig?.mobileBackground?.type === 'image' ? campaign.canvasConfig.mobileBackground.value : undefined),
    
    // Background color/gradient (fallback)
    background: campaign?.design?.background || 
      (campaign?.canvasConfig?.background?.type === 'color' ? campaign.canvasConfig.background.value : undefined),
    
    // Screen-specific backgrounds
    screenBackgrounds: campaign?.screenBackgrounds || campaign?.design?.screenBackgrounds || {},
    
    // Extracted colors from images
    extractedColors: campaign?.extractedColors || campaign?.design?.extractedColors || [],
    
    // Custom colors configuration
    customColors: campaign?.design?.customColors || {},
    
    // Design modules (for modular editor compatibility)
    designModules: campaign?.modularPage || campaign?.design?.designModules,
    
    // Quiz modules (for QuizEditor compatibility) - CRITICAL: prioritize direct modularPage as it's synced from store
    quizModules: campaign?.modularPage || campaign?.config?.modularPage || campaign?.design?.quizModules,
    
    // Custom texts and images - AUTO-POPULATE images from all sources
    customTexts: campaign?.design?.customTexts || [],
    customImages: extractAllCampaignImages(campaign),
    
    // Border and style settings
    borderStyle: campaign?.design?.borderStyle,
    wheelBorderStyle: campaign?.design?.wheelBorderStyle
  };

  // Build comprehensive game_config
  const mergedGameConfig = {
    ...(campaign?.game_config || {}),
    ...(campaign?.gameConfig || {}),
    
    // Type-specific game configurations
    ...(campaign?.type === 'wheel' && campaign?.wheelConfig ? { wheel: campaign.wheelConfig } : {}),
    ...(campaign?.type === 'quiz' && campaign?.quizConfig ? { quiz: campaign.quizConfig } : {}),
    ...(campaign?.type === 'scratch' && campaign?.scratchConfig ? { scratch: campaign.scratchConfig } : {}),
    ...(campaign?.type === 'jackpot' && campaign?.jackpotConfig ? { jackpot: campaign.jackpotConfig } : {})
  };

  // Detect editor mode (article vs fullscreen)
  // ✅ CRITICAL: Check both editorMode and editor_mode fields
  const editorMode = campaign?.editorMode || campaign?.editor_mode || 'fullscreen';
  const isArticleMode = editorMode === 'article';
  
  console.log('📝 [saveCampaignToDB] Editor mode detected:', {
    editorMode,
    campaignEditorMode: campaign?.editorMode,
    campaignEditor_mode: campaign?.editor_mode,
    isArticleMode,
    hasArticleConfig: !!campaign?.articleConfig
  });

  // Build article configuration if in article mode
  const articleConfig = isArticleMode ? {
    ...(campaign?.articleConfig || {}),
    banner: {
      ...(campaign?.articleConfig?.banner || {}),
      imageUrl: campaign?.articleConfig?.banner?.imageUrl || campaign?.banner_url
    },
    title: campaign?.articleConfig?.title || '',
    description: campaign?.articleConfig?.description || '',
    cta: {
      ...(campaign?.articleConfig?.cta || {}),
      text: campaign?.articleConfig?.cta?.text || 'PARTICIPER',
      style: campaign?.articleConfig?.cta?.style || {}
    },
    layout: {
      ...(campaign?.articleConfig?.layout || {}),
      maxWidth: campaign?.articleConfig?.layout?.maxWidth || 810
    }
  } : undefined;

  // Build final payload with ALL campaign data
  const payload: any = {
    id: isUuid(campaign?.id) ? campaign?.id : undefined,
    name: campaign?.name || 'Nouvelle campagne',
    description: campaign?.description,
    slug: campaign?.slug,
    type: campaign?.type, // do not force a default here
    status: campaign?.status || 'draft',
    
    // Editor mode (article or fullscreen)
    editor_mode: editorMode,
    
    // Complete configuration
    config: mergedConfig,
    
    // Game-specific configuration
    game_config: mergedGameConfig,
    
    // Complete design with all visual elements
    design: mergedDesign,
    
    // Article configuration (only for article mode)
    ...(isArticleMode && articleConfig ? { article_config: articleConfig } : {}),
    
    // Form fields
    form_fields: normalizedFormFields,
    
    // Campaign timing - with default dates to ensure campaigns always have valid dates
    start_date: campaign?.start_date || new Date().toISOString(),
    end_date: campaign?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    
    // Media assets
    thumbnail_url: campaign?.thumbnail_url,
    banner_url: campaign?.banner_url,
  };

    console.log('💾 [saveCampaignToDB] Complete payload structure:', {
      id: payload.id,
      name: payload.name,
      type: payload.type,
      editorMode: payload.editor_mode,
      hasArticleConfig: !!payload.article_config,
      articleConfigKeys: payload.article_config ? Object.keys(payload.article_config) : [],
      configKeys: Object.keys(payload.config || {}),
      designKeys: Object.keys(payload.design || {}),
      gameConfigKeys: Object.keys(payload.game_config || {}),
      canvasElements: payload.config?.canvasConfig?.elements?.length || 0,
      modularPageScreens: Object.keys(payload.config?.modularPage?.screens || {}).length,
      formFieldsCount: payload.form_fields?.length || 0
    });

    const saved = await saveCampaignFn(payload);
    
    console.log('✅ [saveCampaignToDB] Campaign saved successfully:', {
      id: saved?.id,
      name: saved?.name,
      type: saved?.type
    });
    
    return saved;
  } finally {
    // 🔓 Always release lock, even on error
    releaseSaveLock(campaignIdentifier);
  }
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

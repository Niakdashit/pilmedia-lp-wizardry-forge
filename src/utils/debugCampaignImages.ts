/**
 * Utilitaire de debug pour diagnostiquer les problèmes d'images de campagnes
 */

export const debugCampaignImage = (campaign: any): void => {
  console.group(`🔍 DEBUG Campaign: ${campaign.name || campaign.id}`);
  
  console.log('📊 Structure complète:', {
    id: campaign.id,
    type: campaign.type,
    name: campaign.name
  });
  
  console.log('🎨 design:', {
    hasDesign: !!campaign.design,
    backgroundImage: campaign.design?.backgroundImage,
    background: campaign.design?.background,
    mobileBackgroundImage: campaign.design?.mobileBackgroundImage,
    designKeys: campaign.design ? Object.keys(campaign.design) : []
  });
  
  console.log('⚙️ canvasConfig:', {
    hasCanvasConfig: !!campaign.canvasConfig,
    background: campaign.canvasConfig?.background,
    canvasConfigKeys: campaign.canvasConfig ? Object.keys(campaign.canvasConfig) : []
  });
  
  console.log('📦 config:', {
    hasConfig: !!campaign.config,
    canvasConfig: campaign.config?.canvasConfig,
    configKeys: campaign.config ? Object.keys(campaign.config) : []
  });
  
  console.log('🎯 config.canvasConfig:', {
    hasConfigCanvasConfig: !!campaign.config?.canvasConfig,
    background: campaign.config?.canvasConfig?.background,
    elements: campaign.config?.canvasConfig?.elements?.length || 0
  });
  
  // Tester toutes les sources possibles
  const sources = {
    'design.backgroundImage': campaign.design?.backgroundImage,
    'design.background': campaign.design?.background,
    'canvasConfig.background.value': campaign.canvasConfig?.background?.value,
    'config.canvasConfig.background.value': campaign.config?.canvasConfig?.background?.value,
    'config.canvasConfig.background': campaign.config?.canvasConfig?.background,
    'banner_url': campaign.banner_url,
    'thumbnail_url': campaign.thumbnail_url
  };
  
  console.log('🔗 Toutes les sources d\'images possibles:', sources);
  
  // Identifier la première source valide
  const validSource = Object.entries(sources).find(([_, value]) => {
    if (typeof value === 'string' && value.length > 0) return true;
    if (value && typeof value === 'object' && value.type === 'image' && value.value) return true;
    return false;
  });
  
  if (validSource) {
    console.log('✅ Source valide trouvée:', validSource[0], '=', validSource[1]);
  } else {
    console.warn('❌ Aucune source d\'image valide trouvée');
  }
  
  console.groupEnd();
};

/**
 * Extrait l'image de fond d'une campagne avec logique exhaustive
 */
export const extractCampaignBackgroundImage = (campaign: any): string | null => {
  if (!campaign) return null;
  
  // PRIORITÉ 1: design.backgroundImage (string directe)
  if (campaign.design?.backgroundImage && typeof campaign.design.backgroundImage === 'string') {
    console.log('✅ Image trouvée: design.backgroundImage');
    return campaign.design.backgroundImage;
  }
  
  // PRIORITÉ 2: canvasConfig.background.value (structure moderne)
  if (campaign.canvasConfig?.background?.type === 'image' && campaign.canvasConfig.background.value) {
    console.log('✅ Image trouvée: canvasConfig.background.value');
    return campaign.canvasConfig.background.value;
  }
  
  // PRIORITÉ 3: config.canvasConfig.background.value (structure imbriquée)
  if (campaign.config?.canvasConfig?.background?.type === 'image' && campaign.config.canvasConfig.background.value) {
    console.log('✅ Image trouvée: config.canvasConfig.background.value');
    return campaign.config.canvasConfig.background.value;
  }
  
  // PRIORITÉ 4: design.background si c'est une URL directe
  if (campaign.design?.background && typeof campaign.design.background === 'string') {
    if (campaign.design.background.startsWith('http') || 
        campaign.design.background.startsWith('blob:') ||
        campaign.design.background.startsWith('data:')) {
      console.log('✅ Image trouvée: design.background (URL)');
      return campaign.design.background;
    }
  }
  
  // PRIORITÉ 5: banner_url (fallback)
  if (campaign.banner_url && typeof campaign.banner_url === 'string') {
    console.log('✅ Image trouvée: banner_url');
    return campaign.banner_url;
  }
  
  // PRIORITÉ 6: thumbnail_url (fallback)
  if (campaign.thumbnail_url && typeof campaign.thumbnail_url === 'string') {
    console.log('✅ Image trouvée: thumbnail_url');
    return campaign.thumbnail_url;
  }
  
  // PRIORITÉ 7: design.customImages (première image de la liste)
  if (campaign.design?.customImages && Array.isArray(campaign.design.customImages) && campaign.design.customImages.length > 0) {
    const firstImage = campaign.design.customImages[0];
    if (typeof firstImage === 'string' && firstImage.length > 0) {
      console.log('✅ Image trouvée: design.customImages[0]');
      return firstImage;
    }
  }
  
  // PRIORITÉ 8: screenBackgrounds (premier écran avec image)
  if (campaign.design?.screenBackgrounds || campaign.screenBackgrounds) {
    const backgrounds = campaign.design?.screenBackgrounds || campaign.screenBackgrounds;
    for (const [screenKey, screenBg] of Object.entries(backgrounds)) {
      if (screenBg && typeof screenBg === 'object') {
        const bgImage = (screenBg as any).desktop?.backgroundImage?.url || 
                       (screenBg as any).backgroundImage?.url ||
                       (screenBg as any).desktop?.url ||
                       (screenBg as any).url;
        if (bgImage && typeof bgImage === 'string') {
          console.log(`✅ Image trouvée: screenBackgrounds.${screenKey}`);
          return bgImage;
        }
      }
    }
  }
  
  // PRIORITÉ 9: game_config (images de jeu)
  if (campaign.game_config) {
    // Pour la roue - image de centre
    if (campaign.game_config.wheel?.centerImage) {
      console.log('✅ Image trouvée: game_config.wheel.centerImage');
      return campaign.game_config.wheel.centerImage;
    }
    // Pour le scratch - image de couverture
    if (campaign.game_config.scratch?.coverImage) {
      console.log('✅ Image trouvée: game_config.scratch.coverImage');
      return campaign.game_config.scratch.coverImage;
    }
  }
  
  // PRIORITÉ 10: Pour les articles - modules avec images
  if (campaign.type === 'article' && campaign.modules) {
    const moduleWithImage = campaign.modules.find((m: any) => 
      m.type === 'image' || (m.backgroundImage && m.backgroundImage !== '')
    );
    if (moduleWithImage?.backgroundImage) {
      console.log('✅ Image trouvée: module.backgroundImage');
      return moduleWithImage.backgroundImage;
    }
    if (moduleWithImage?.src) {
      console.log('✅ Image trouvée: module.src');
      return moduleWithImage.src;
    }
  }
  
  console.warn('❌ Aucune image trouvée pour cette campagne');
  
  // Debug détaillé pour comprendre pourquoi
  console.group('🔍 Sources vérifiées sans succès:');
  console.log('1. design.backgroundImage:', campaign.design?.backgroundImage);
  console.log('2. canvasConfig.background:', campaign.canvasConfig?.background);
  console.log('3. config.canvasConfig.background:', campaign.config?.canvasConfig?.background);
  console.log('4. design.background:', campaign.design?.background);
  console.log('5. banner_url:', campaign.banner_url);
  console.log('6. thumbnail_url:', campaign.thumbnail_url);
  console.log('7. design.customImages:', campaign.design?.customImages);
  console.log('8. screenBackgrounds:', campaign.design?.screenBackgrounds || campaign.screenBackgrounds);
  console.log('9. game_config.wheel:', campaign.game_config?.wheel);
  console.log('10. game_config.scratch:', campaign.game_config?.scratch);
  console.log('11. modules:', campaign.modules);
  console.log('📦 Structure complète design:', campaign.design);
  console.log('📦 Structure complète config:', campaign.config);
  console.log('📦 Structure complète game_config:', campaign.game_config);
  console.groupEnd();
  
  return null;
};

/**
 * Extrait la couleur de fond d'une campagne
 */
export const extractCampaignBackgroundColor = (campaign: any): string | null => {
  if (!campaign) return null;
  
  // Source 1: canvasConfig.background (couleur)
  if (campaign.canvasConfig?.background?.type === 'color' && campaign.canvasConfig.background.value) {
    return campaign.canvasConfig.background.value;
  }
  
  // Source 2: config.canvasConfig.background (couleur)
  if (campaign.config?.canvasConfig?.background?.type === 'color' && campaign.config.canvasConfig.background.value) {
    return campaign.config.canvasConfig.background.value;
  }
  
  // Source 3: design.background (objet)
  if (campaign.design?.background?.type === 'color' && campaign.design.background.value) {
    return campaign.design.background.value;
  }
  
  // Source 4: design.background (string direct - couleur hex ou gradient)
  if (typeof campaign.design?.background === 'string') {
    if (campaign.design.background.startsWith('#') || 
        campaign.design.background.startsWith('linear-gradient') ||
        campaign.design.background.startsWith('radial-gradient') ||
        campaign.design.background.startsWith('rgb')) {
      return campaign.design.background;
    }
  }
  
  // Source 5: design.background.desktop
  if (campaign.design?.background?.desktop?.type === 'color' && campaign.design.background.desktop.value) {
    return campaign.design.background.desktop.value;
  }
  
  // Source 6: brandColors.primary
  if (campaign.design?.brandColors?.primary) {
    return campaign.design.brandColors.primary;
  }
  
  // Source 7: backgroundColor direct
  if (campaign.design?.backgroundColor) {
    return campaign.design.backgroundColor;
  }
  
  // Source 8: Pour les articles - couleur de fond des modules
  if (campaign.type === 'article' && campaign.modules) {
    const moduleWithBg = campaign.modules.find((m: any) => m.backgroundColor);
    if (moduleWithBg?.backgroundColor) {
      return moduleWithBg.backgroundColor;
    }
  }
  
  return null;
};

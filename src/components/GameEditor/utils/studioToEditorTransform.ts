
import type { EditorConfig, CustomText, GameType, DeviceType } from '../GameEditorLayout';

export const transformStudioToEditorConfig = (studioData: any): EditorConfig => {
  console.log('🔄 Starting transformation of studio data:', studioData);
  
  // Extract basic info
  const gameType = studioData.type || 'wheel';
  const displayMode = studioData.displayMode || 'mode2-background';
  
  // Create custom texts from studio data
  const customTexts: CustomText[] = [];
  
  // Extract texts from various sources in studio data
  const textSources = [
    { content: studioData.title, id: 'main-title', size: '2xl', color: '#1f2937', bold: true },
    { content: studioData.subtitle, id: 'subtitle', size: 'lg', color: '#4b5563', bold: false },
    { content: studioData.description, id: 'description', size: 'base', color: '#6b7280', bold: false },
    { content: studioData.mechanics, id: 'mechanics', size: 'sm', color: '#9ca3af', bold: false },
    { content: studioData.legalMentions, id: 'legal-mentions', size: 'xs', color: '#9ca3af', bold: false }
  ];
  
  // Add texts from screens if available
  if (studioData.screens?.start?.title) {
    textSources.push({
      content: studioData.screens.start.title,
      id: 'start-title',
      size: '2xl',
      color: '#1f2937',
      bold: true
    });
  }
  
  if (studioData.screens?.start?.subtitle) {
    textSources.push({
      content: studioData.screens.start.subtitle,
      id: 'start-subtitle',
      size: 'lg',
      color: '#4b5563',
      bold: false
    });
  }
  
  // Process each text source
  textSources.forEach((source, index) => {
    if (source.content && source.content.trim()) {
      console.log(`📝 Processing text ${index}:`, source);
      
      // Calculate position based on content and index
      let x = 50;
      let y = 50 + (index * 60);
      
      // Special positioning for known content
      if (source.content.includes('Gagnez') || source.content.includes('vacances')) {
        x = 50;
        y = 15;
      } else if (source.content.includes('Participez')) {
        x = 50;
        y = 85;
      } else if (source.content.includes('Séjour')) {
        x = 50;
        y = 1000;
      } else if (source.content.includes('conditions')) {
        x = 50;
        y = 1100;
      }
      
      const customText: CustomText = {
        id: source.id,
        content: source.content,
        x,
        y,
        size: source.size,
        color: source.color,
        fontFamily: 'Inter, sans-serif',
        bold: source.bold,
        italic: false,
        underline: false,
        enabled: true,
        showFrame: false,
        frameColor: '#ffffff',
        frameBorderColor: '#e5e7eb'
      };
      
      console.log('✅ Created custom text:', customText);
      customTexts.push(customText);
    }
  });
  
  // Handle logo as custom image
  const customImages = [];
  if (studioData.design?.centerLogo || studioData.design?.logo) {
    const logoUrl = studioData.design?.centerLogo || studioData.design?.logo;
    customImages.push({
      id: 'logo',
      src: logoUrl,
      x: 50,
      y: 500,
      width: 100,
      height: 100,
      rotation: 0,
      enabled: true
    });
  }
  
  const transformedConfig: EditorConfig = {
    gameType: gameType as GameType,
    displayMode,
    customTexts,
    design: {
      backgroundImage: studioData.design?.backgroundImage || null,
      mobileBackgroundImage: studioData.design?.mobileBackgroundImage || null,
      centerLogo: studioData.design?.centerLogo || null,
      customImages,
      primaryColor: studioData.design?.primaryColor || '#3b82f6',
      secondaryColor: studioData.design?.secondaryColor || '#10b981',
      accentColor: studioData.design?.accentColor || '#f59e0b',
      textColor: studioData.design?.textColor || '#1f2937',
      backgroundColor: studioData.design?.backgroundColor || '#ffffff',
      borderColor: studioData.design?.borderColor || '#e5e7eb',
      borderRadius: studioData.design?.borderRadius || '8px'
    },
    gameConfig: {
      wheelSegments: studioData.gameConfig?.wheel?.segments || [],
      buttonLabel: studioData.gameConfig?.buttonLabel || 'Jouer',
      buttonColor: studioData.design?.primaryColor || '#3b82f6',
      buttonTextColor: '#ffffff'
    },
    formFields: studioData.formFields || [],
    source: 'studio-transform',
    _isTransformed: true
  };
  
  console.log('✅ Final transformed config:', transformedConfig);
  console.log('📝 Final custom texts count:', customTexts.length);
  
  return transformedConfig;
};

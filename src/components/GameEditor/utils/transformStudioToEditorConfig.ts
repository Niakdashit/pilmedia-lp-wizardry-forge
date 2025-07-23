
import { generateUniqueId } from './generateUniqueId';

export const transformStudioToEditorConfig = (studioConfig: any) => {
  console.log('🔄 Transformation Studio vers Editor Config:', studioConfig);
  
  if (!studioConfig) {
    console.warn('⚠️ Pas de configuration studio fournie');
    return null;
  }

  // Transformer les textes personnalisés avec des positions en pixels
  const customTexts = studioConfig.customTexts?.map((text: any, index: number) => {
    // Positions par défaut pour rendre les textes visibles
    const basePositions = [
      { x: 100, y: 100 },  // Premier texte - titre
      { x: 100, y: 200 },  // Deuxième texte - description
      { x: 100, y: 300 },  // Troisième texte - détails
      { x: 100, y: 400 }   // Quatrième texte - conditions
    ];

    const position = basePositions[index] || { x: 100, y: 100 + (index * 100) };
    
    // Déterminer la taille en fonction du type de texte
    const fontSize = index === 0 ? 32 : 16; // Titre plus grand
    const fontWeight = index === 0 ? 'bold' : 'normal';
    
    const transformedText = {
      id: text.id || generateUniqueId(),
      content: text.content || text.text || '',
      x: position.x,
      y: position.y,
      fontSize: fontSize,
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff', // Texte blanc pour contraste sur image
      fontWeight: fontWeight,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      width: 400,
      height: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent pour lisibilité
      size: fontSize > 20 ? 'lg' : 'base',
      bold: fontWeight === 'bold',
      italic: false,
      underline: false,
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Ombre pour améliorer la lisibilité
      listType: 'none',
      deviceConfig: {
        desktop: { x: position.x, y: position.y, fontSize: fontSize },
        tablet: { x: position.x * 0.8, y: position.y * 0.8, fontSize: fontSize * 0.9 },
        mobile: { x: position.x * 0.6, y: position.y * 0.7, fontSize: fontSize * 0.8 }
      }
    };

    console.log('✅ Texte transformé:', {
      id: transformedText.id,
      content: transformedText.content,
      position: { x: transformedText.x, y: transformedText.y },
      fontSize: transformedText.fontSize,
      color: transformedText.color
    });

    return transformedText;
  }) || [];

  // Transformer les images personnalisées
  const customImages = studioConfig.customImages?.map((image: any) => ({
    id: image.id || generateUniqueId(),
    src: image.src || image.url || '',
    x: image.x || 0,
    y: image.y || 0,
    width: image.width || 100,
    height: image.height || 100,
    rotation: image.rotation || 0,
    enabled: true
  })) || [];

  const editorConfig = {
    gameType: studioConfig.gameType || 'wheel',
    displayMode: 'mode2-background',
    customTexts: customTexts,
    design: {
      ...studioConfig.design,
      customImages: customImages,
      backgroundImage: studioConfig.design?.backgroundImage || studioConfig.backgroundImage
    },
    // Conserver les autres propriétés du studio
    ...studioConfig
  };

  console.log('🎯 Configuration Editor finale:', {
    textsCount: customTexts.length,
    imagesCount: customImages.length,
    backgroundImage: editorConfig.design?.backgroundImage
  });

  return editorConfig;
};

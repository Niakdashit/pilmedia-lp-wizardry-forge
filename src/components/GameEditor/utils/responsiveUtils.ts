
import type { CustomText } from '../GameEditorLayout';

/**
 * Obtient les dimensions réelles des conteneurs pour chaque appareil
 * Basé sur l'analyse des dimensions observées dans l'interface réelle
 */
const getContainerDimensions = (device: 'desktop' | 'tablet' | 'mobile') => {
  // Dimensions optimisées pour le Branding IA et l'affichage des textes
  const dimensions = {
    // Desktop: format 16:9 optimisé
    desktop: { width: 800, height: 450 },
    // Tablet: format équilibré
    tablet: { width: 600, height: 450 },
    // Mobile: format portrait compact
    mobile: { width: 320, height: 480 }
  };
  
  return dimensions[device];
};

/**
 * Détecte si un élément est centré intentionnellement
 */
const isElementCentered = (
  element: CustomText,
  container: { width: number; height: number },
  tolerance: number = 30
) => {
  const elementWidth = element.width || 200; // Largeur estimée si non définie
  const elementHeight = element.height || 50; // Hauteur estimée si non définie
  
  const centerX = container.width / 2;
  const centerY = container.height / 2;
  
  const elementCenterX = element.x + (elementWidth / 2);
  const elementCenterY = element.y + (elementHeight / 2);
  
  const isHorizontallyCentered = Math.abs(elementCenterX - centerX) <= tolerance;
  const isVerticallyCentered = Math.abs(elementCenterY - centerY) <= tolerance;
  
  return {
    horizontal: isHorizontallyCentered,
    vertical: isVerticallyCentered,
    both: isHorizontallyCentered && isVerticallyCentered
  };
};

/**
 * Calcule la position pour un élément centré
 */
const calculateCenteredPosition = (
  container: { width: number; height: number },
  elementWidth: number = 200,
  elementHeight: number = 50
) => {
  return {
    x: Math.round((container.width - elementWidth) / 2),
    y: Math.round((container.height - elementHeight) / 2)
  };
};

/**
 * Calcule la position proportionnelle pour maintenir le même placement relatif
 * Amélioration: détection et préservation du centrage intelligent
 */
export const calculateResponsiveProperties = (
  baseText: CustomText,
  targetDevice: 'desktop' | 'tablet' | 'mobile',
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  const baseContainer = getContainerDimensions(baseDevice);
  const targetContainer = getContainerDimensions(targetDevice);
  
  // Détecter si l'élément est centré sur l'appareil de base
  const centeringInfo = isElementCentered(baseText, baseContainer);
  
  // Calcul des ratios de transformation
  const widthRatio = targetContainer.width / baseContainer.width;
  const heightRatio = targetContainer.height / baseContainer.height;
  
  // Calcul intelligent de la taille de police
  const fontScaleRatio = (widthRatio * 0.7) + (heightRatio * 0.3);
  const newFontSize = Math.round(baseText.fontSize * fontScaleRatio);
  
  // Calcul des dimensions adaptées
  const newWidth = baseText.width ? Math.round(baseText.width * widthRatio) : undefined;
  const newHeight = baseText.height ? Math.round(baseText.height * heightRatio) : undefined;
  
  let newX, newY;
  
  // Si l'élément est centré, le recentrer sur le nouvel appareil
  if (centeringInfo.both) {
    const centeredPos = calculateCenteredPosition(
      targetContainer, 
      newWidth || 200, 
      newHeight || 50
    );
    newX = centeredPos.x;
    newY = centeredPos.y;
  } else if (centeringInfo.horizontal) {
    // Centrage horizontal uniquement
    const centeredPos = calculateCenteredPosition(
      targetContainer, 
      newWidth || 200, 
      newHeight || 50
    );
    newX = centeredPos.x;
    newY = Math.round((baseText.y / baseContainer.height) * targetContainer.height);
  } else if (centeringInfo.vertical) {
    // Centrage vertical uniquement
    const centeredPos = calculateCenteredPosition(
      targetContainer, 
      newWidth || 200, 
      newHeight || 50
    );
    newX = Math.round((baseText.x / baseContainer.width) * targetContainer.width);
    newY = centeredPos.y;
  } else {
    // Positionnement proportionnel normal
    newX = Math.round((baseText.x / baseContainer.width) * targetContainer.width);
    newY = Math.round((baseText.y / baseContainer.height) * targetContainer.height);
  }
  
  return {
    x: Math.max(0, newX),
    y: Math.max(0, newY),
    fontSize: Math.max(10, Math.min(72, newFontSize)),
    width: newWidth ? Math.max(50, newWidth) : undefined,
    height: newHeight ? Math.max(20, newHeight) : undefined,
    // Ajouter l'alignement de texte pour les éléments centrés
    textAlign: centeringInfo.horizontal ? 'center' : undefined
  };
};

/**
 * Synchronise les propriétés d'un texte entre tous les appareils
 * Amélioration: gestion plus robuste des configurations par appareil
 */
export const synchronizeTextAcrossDevices = (
  text: CustomText,
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): CustomText => {
  const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
  
  // Initialiser deviceConfig si non existant
  const updatedDeviceConfig = text.deviceConfig || {
    desktop: {},
    tablet: {},
    mobile: {}
  };
  
  devices.forEach(device => {
    if (device !== baseDevice) {
      // Calculer les propriétés responsives pour cet appareil
      const responsiveProps = calculateResponsiveProperties(text, device, baseDevice);
      
      // Mettre à jour la configuration de l'appareil
      updatedDeviceConfig[device] = {
        ...updatedDeviceConfig[device],
        x: responsiveProps.x,
        y: responsiveProps.y,
        fontSize: responsiveProps.fontSize,
        width: responsiveProps.width,
        height: responsiveProps.height
      };
    } else {
      // Pour l'appareil de base, utiliser les valeurs principales du texte
      updatedDeviceConfig[device] = {
        ...updatedDeviceConfig[device],
        x: text.x,
        y: text.y,
        fontSize: text.fontSize,
        width: text.width,
        height: text.height
      };
    }
  });
  
  return {
    ...text,
    deviceConfig: updatedDeviceConfig
  };
};

/**
 * Applique la cohérence responsive à tous les textes d'une configuration
 */
export const applyResponsiveConsistency = (
  customTexts: CustomText[],
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): CustomText[] => {
  return customTexts.map(text => synchronizeTextAcrossDevices(text, baseDevice));
};

/**
 * Fonction utilitaire pour déboguer les calculs de position
 */
export const debugResponsiveCalculations = (
  text: CustomText,
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
  
  console.group(`🔍 Debug positions pour texte "${text.content}"`);
  
  devices.forEach(device => {
    const baseContainer = getContainerDimensions(baseDevice);
    const targetContainer = getContainerDimensions(device);
    
    if (device === baseDevice) {
      console.log(`📱 ${device} (BASE):`, {
        position: { x: text.x, y: text.y },
        fontSize: text.fontSize,
        container: baseContainer
      });
    } else {
      const calculated = calculateResponsiveProperties(text, device, baseDevice);
      console.log(`📱 ${device}:`, {
        position: { x: calculated.x, y: calculated.y },
        fontSize: calculated.fontSize,
        container: targetContainer,
        ratios: {
          width: targetContainer.width / baseContainer.width,
          height: targetContainer.height / baseContainer.height
        }
      });
    }
  });
  
  console.groupEnd();
};

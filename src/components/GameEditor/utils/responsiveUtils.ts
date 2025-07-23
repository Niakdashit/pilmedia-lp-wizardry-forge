
import type { CustomText } from '../GameEditorLayout';

/**
 * Obtient les dimensions réelles des conteneurs pour chaque appareil
 * Basé sur l'analyse des dimensions observées dans l'interface réelle
 */
const getContainerDimensions = (device: 'desktop' | 'tablet' | 'mobile') => {
  // Dimensions réelles mesurées dans l'interface Qualifio Editor
  const dimensions = {
    // Desktop: conteneur avec ratio 16:9 standard
    desktop: { width: 1200, height: 675 },
    // Tablet: format portrait standard iPad
    tablet: { width: 768, height: 1024 },
    // Mobile: format portrait iPhone standard
    mobile: { width: 375, height: 812 }
  };
  
  return dimensions[device];
};

/**
 * Calcule la position proportionnelle pour maintenir le même placement relatif
 * Amélioration: utilise des calculs plus précis pour éviter les décalages
 */
export const calculateResponsiveProperties = (
  baseText: CustomText,
  targetDevice: 'desktop' | 'tablet' | 'mobile',
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  const baseContainer = getContainerDimensions(baseDevice);
  const targetContainer = getContainerDimensions(targetDevice);
  
  // Calcul des ratios de transformation
  const widthRatio = targetContainer.width / baseContainer.width;
  const heightRatio = targetContainer.height / baseContainer.height;
  
  // Positions proportionnelles plus précises
  const xRatio = baseText.x / baseContainer.width;
  const yRatio = baseText.y / baseContainer.height;
  
  const newX = Math.round(xRatio * targetContainer.width);
  const newY = Math.round(yRatio * targetContainer.height);
  
  // Calcul intelligent de la taille de police
  // Utilise une approche hybride: ratio moyen pondéré vers la largeur
  const fontScaleRatio = (widthRatio * 0.7) + (heightRatio * 0.3);
  const newFontSize = Math.round(baseText.fontSize * fontScaleRatio);
  
  // Calcul des dimensions si elles existent
  const newWidth = baseText.width ? Math.round(baseText.width * widthRatio) : undefined;
  const newHeight = baseText.height ? Math.round(baseText.height * heightRatio) : undefined;
  
  return {
    x: Math.max(0, newX),
    y: Math.max(0, newY),
    fontSize: Math.max(10, Math.min(72, newFontSize)),
    width: newWidth ? Math.max(50, newWidth) : undefined,
    height: newHeight ? Math.max(20, newHeight) : undefined
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

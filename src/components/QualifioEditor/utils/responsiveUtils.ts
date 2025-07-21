import type { CustomText } from '../QualifioEditorLayout';

/**
 * Obtient les dimensions réelles du conteneur actuel
 */
const getContainerDimensions = (device: 'desktop' | 'tablet' | 'mobile') => {
  // Essayer de trouver le conteneur de prévisualisation actuel
  const previewContainer = document.querySelector('[class*="preview"]') || 
                           document.querySelector('.relative.bg-center') ||
                           document.querySelector('div[style*="backgroundImage"]');
  
  if (previewContainer) {
    const rect = previewContainer.getBoundingClientRect();
    return {
      width: rect.width || 800,
      height: rect.height || 600
    };
  }
  
  // Valeurs par défaut basées sur les dimensions observées dans l'interface
  const defaults = {
    desktop: { width: 1200, height: 675 }, // Ratio 16:9 pour desktop
    tablet: { width: 600, height: 800 },   // Format portrait tablette
    mobile: { width: 400, height: 700 }    // Format portrait mobile
  };
  
  return defaults[device];
};

/**
 * Calcule la position proportionnelle pour maintenir le même placement relatif
 */
export const calculateResponsiveProperties = (
  baseText: CustomText,
  targetDevice: 'desktop' | 'tablet' | 'mobile',
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  const baseContainer = getContainerDimensions(baseDevice);
  const targetContainer = getContainerDimensions(targetDevice);
  
  // Calcul des positions proportionnelles
  const xRatio = baseText.x / baseContainer.width;
  const yRatio = baseText.y / baseContainer.height;
  
  const newX = Math.round(xRatio * targetContainer.width);
  const newY = Math.round(yRatio * targetContainer.height);
  
  // Échelles de police adaptées aux tailles d'écran
  const fontScales = {
    desktop: 1.0,
    tablet: 0.85,
    mobile: 0.75
  };
  
  const fontScale = fontScales[targetDevice] / fontScales[baseDevice];
  const newFontSize = Math.round(baseText.fontSize * fontScale);
  
  // Échelle des dimensions
  const widthRatio = targetContainer.width / baseContainer.width;
  const heightRatio = targetContainer.height / baseContainer.height;
  const avgRatio = Math.min(widthRatio, heightRatio); // Utiliser le plus petit ratio pour éviter le débordement
  
  return {
    x: newX,
    y: newY,
    fontSize: Math.max(8, Math.min(72, newFontSize)),
    width: baseText.width ? Math.round(baseText.width * avgRatio) : undefined,
    height: baseText.height ? Math.round(baseText.height * avgRatio) : undefined
  };
};

/**
 * Synchronise les propriétés d'un texte entre tous les appareils
 */
export const synchronizeTextAcrossDevices = (
  text: CustomText,
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): CustomText => {
  const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
  
  const updatedDeviceConfig = { ...text.deviceConfig };
  
  devices.forEach(device => {
    if (device !== baseDevice) {
      const responsiveProps = calculateResponsiveProperties(text, device, baseDevice);
      updatedDeviceConfig[device] = {
        ...updatedDeviceConfig[device],
        ...responsiveProps
      };
    } else {
      // Pour l'appareil de base, on utilise les valeurs principales
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
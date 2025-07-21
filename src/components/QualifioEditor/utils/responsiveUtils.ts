import type { CustomText } from '../QualifioEditorLayout';

/**
 * Obtient les dimensions standardisées pour chaque appareil
 * Ces dimensions correspondent aux tailles réelles des conteneurs dans l'interface
 */
const getContainerDimensions = (device: 'desktop' | 'tablet' | 'mobile') => {
  // Dimensions standardisées basées sur l'interface réelle
  const dimensions = {
    desktop: { width: 1120, height: 630 },  // Dimensions du conteneur desktop observées
    tablet: { width: 768, height: 1024 },   // Dimensions du conteneur tablette observées  
    mobile: { width: 375, height: 667 }     // Dimensions du conteneur mobile observées
  };
  
  return dimensions[device];
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
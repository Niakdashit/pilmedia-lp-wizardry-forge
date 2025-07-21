import type { CustomText } from '../QualifioEditorLayout';

// Dimensions des conteneurs par appareil (basées sur les contraintes Qualifio)
const DEVICE_CONTAINERS = {
  desktop: { width: 1200, height: 800 },
  tablet: { width: 850, height: 1200 },
  mobile: { width: 520, height: 1100 }
};

// Échelles de police pour maintenir la lisibilité
const FONT_SCALES = {
  desktop: 1.0,
  tablet: 0.9,
  mobile: 0.8
};

/**
 * Calcule la position proportionnelle pour maintenir le même placement relatif
 */
export const calculateResponsiveProperties = (
  baseText: CustomText,
  targetDevice: 'desktop' | 'tablet' | 'mobile',
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  const baseContainer = DEVICE_CONTAINERS[baseDevice];
  const targetContainer = DEVICE_CONTAINERS[targetDevice];
  
  // Calcul des positions proportionnelles
  const xRatio = baseText.x / baseContainer.width;
  const yRatio = baseText.y / baseContainer.height;
  
  const newX = Math.round(xRatio * targetContainer.width);
  const newY = Math.round(yRatio * targetContainer.height);
  
  // Échelle de la police
  const fontScale = FONT_SCALES[targetDevice] / FONT_SCALES[baseDevice];
  const newFontSize = Math.round(baseText.fontSize * fontScale);
  
  // Échelle des dimensions (si elles existent)
  const widthRatio = targetContainer.width / baseContainer.width;
  const heightRatio = targetContainer.height / baseContainer.height;
  const avgRatio = (widthRatio + heightRatio) / 2;
  
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
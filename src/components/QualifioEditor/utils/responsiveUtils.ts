import type { CustomText } from '../QualifioEditorLayout';

// Échelles de base pour maintenir la cohérence entre les appareils
const DEVICE_SCALES = {
  desktop: 1.0,
  tablet: 0.85,
  mobile: 0.7
};

// Facteurs de position pour adapter automatiquement selon l'appareil
const POSITION_FACTORS = {
  desktop: { x: 1.0, y: 1.0 },
  tablet: { x: 0.9, y: 0.9 },
  mobile: { x: 0.8, y: 0.8 }
};

/**
 * Calcule la position et la taille adaptées pour un appareil donné
 */
export const calculateResponsiveProperties = (
  baseText: CustomText,
  targetDevice: 'desktop' | 'tablet' | 'mobile',
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  const baseScale = DEVICE_SCALES[baseDevice];
  const targetScale = DEVICE_SCALES[targetDevice];
  const scaleFactor = targetScale / baseScale;
  
  const basePositionFactor = POSITION_FACTORS[baseDevice];
  const targetPositionFactor = POSITION_FACTORS[targetDevice];
  
  return {
    x: Math.round(baseText.x * (targetPositionFactor.x / basePositionFactor.x)),
    y: Math.round(baseText.y * (targetPositionFactor.y / basePositionFactor.y)),
    fontSize: Math.round(baseText.fontSize * scaleFactor),
    width: baseText.width ? Math.round(baseText.width * scaleFactor) : undefined,
    height: baseText.height ? Math.round(baseText.height * scaleFactor) : undefined
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
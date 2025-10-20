/**
 * Types unifiés pour la gestion des backgrounds par écran et par device
 */

export interface BackgroundConfig {
  type: 'color' | 'image';
  value: string;
}

export interface DeviceSpecificBackground extends BackgroundConfig {
  devices?: {
    desktop?: BackgroundConfig;
    tablet?: BackgroundConfig;
    mobile?: BackgroundConfig;
  };
}

export interface ScreenBackgrounds {
  screen1: DeviceSpecificBackground;
  screen2: DeviceSpecificBackground;
  screen3: DeviceSpecificBackground;
}

export type ScreenId = 'screen1' | 'screen2' | 'screen3';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface BackgroundChangeOptions {
  screenId?: ScreenId;
  device?: DeviceType;
  applyToAllScreens?: boolean;
}

/**
 * Utilitaire pour obtenir le background approprié selon le device
 */
export function getDeviceBackground(
  screenBackground: DeviceSpecificBackground | undefined,
  device: DeviceType
): BackgroundConfig {
  if (!screenBackground) {
    return { type: 'color', value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)' };
  }
  
  // Si un background spécifique au device existe, l'utiliser
  if (screenBackground.devices?.[device]) {
    return screenBackground.devices[device]!;
  }
  
  // Sinon, utiliser le background par défaut de l'écran
  return {
    type: screenBackground.type,
    value: screenBackground.value
  };
}

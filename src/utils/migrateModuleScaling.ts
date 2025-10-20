/**
 * Utilitaire pour migrer les modules existants vers le nouveau système de scaling mobile (-48.2%)
 */

import { getDeviceScale } from './deviceDimensions';
import type { DeviceType } from './deviceDimensions';

interface ElementWithDeviceConfig {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  deviceConfig?: {
    desktop?: any;
    tablet?: any;
    mobile?: any;
  };
  [key: string]: any;
}

/**
 * Recalcule les propriétés responsive d'un élément avec le nouveau scaling
 */
export const recalculateElementScaling = (
  element: ElementWithDeviceConfig,
  baseDevice: DeviceType = 'desktop'
): ElementWithDeviceConfig => {
  
  // Si l'élément n'a pas de deviceConfig, on le crée
  if (!element.deviceConfig) {
    element.deviceConfig = {};
  }

  // Recalculer pour mobile avec le nouveau facteur de réduction
  const mobileScale = getDeviceScale(baseDevice, 'mobile');
  
  const mobileConfig: any = {
    x: Math.round(element.x * mobileScale.x),
    y: Math.round(element.y * mobileScale.y),
    width: element.width ? Math.round(element.width * mobileScale.x) : element.width,
    height: element.height ? Math.round(element.height * mobileScale.y) : element.height,
  };

  // Pour les textes, ajuster la taille de police
  if (element.type === 'text' && element.fontSize) {
    const minScale = Math.min(mobileScale.x, mobileScale.y);
    mobileConfig.fontSize = Math.max(12, Math.round(element.fontSize * minScale));
  }

  // Recalculer pour tablette
  const tabletScale = getDeviceScale(baseDevice, 'tablet');
  
  const tabletConfig: any = {
    x: Math.round(element.x * tabletScale.x),
    y: Math.round(element.y * tabletScale.y),
    width: element.width ? Math.round(element.width * tabletScale.x) : element.width,
    height: element.height ? Math.round(element.height * tabletScale.y) : element.height,
  };

  if (element.type === 'text' && element.fontSize) {
    const minScale = Math.min(tabletScale.x, tabletScale.y);
    tabletConfig.fontSize = Math.max(12, Math.round(element.fontSize * minScale));
  }

  return {
    ...element,
    deviceConfig: {
      ...element.deviceConfig,
      mobile: mobileConfig,
      tablet: tabletConfig,
    }
  };
};

/**
 * Migre tous les éléments d'un canvas vers le nouveau système de scaling
 */
export const migrateAllElements = (
  elements: ElementWithDeviceConfig[],
  baseDevice: DeviceType = 'desktop'
): ElementWithDeviceConfig[] => {
  return elements.map(element => recalculateElementScaling(element, baseDevice));
};

/**
 * Vérifie si un élément a besoin d'être migré
 */
export const needsMigration = (element: ElementWithDeviceConfig): boolean => {
  // Si pas de deviceConfig, il faut migrer
  if (!element.deviceConfig || !element.deviceConfig.mobile) {
    return true;
  }

  // Vérifier si le scaling mobile semble utiliser l'ancien système
  // L'ancien système avait un scale plus grand
  const currentMobileScale = element.deviceConfig.mobile.width 
    ? element.deviceConfig.mobile.width / (element.width || 100)
    : 0;

  // Si le scale est supérieur à 0.3, c'est probablement l'ancien système
  // Le nouveau système devrait donner un scale autour de 0.13
  return currentMobileScale > 0.3;
};

/**
 * Compte combien d'éléments ont besoin d'être migrés
 */
export const countElementsNeedingMigration = (elements: ElementWithDeviceConfig[]): number => {
  return elements.filter(needsMigration).length;
};

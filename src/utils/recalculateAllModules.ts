/**
 * Script de migration pour recalculer automatiquement le scaling de tous les modules existants
 * Applique la réduction de 48.2% en mode mobile
 */

import { getDeviceScale, getDeviceDimensions, isElementCentered, calculateCenteredPosition } from './deviceDimensions';
import type { DeviceType } from './deviceDimensions';

interface Element {
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
 * Recalcule le scaling d'un élément avec le nouveau système (-48.2% mobile)
 */
export const recalculateElementScaling = (element: Element, baseDevice: DeviceType = 'desktop'): Element => {
  const baseContainer = getDeviceDimensions(baseDevice);
  
  // Détecter si l'élément est centré
  const elementSize = {
    width: element.width || (element.type === 'text' ? 200 : 100),
    height: element.height || (element.type === 'text' ? 40 : 100)
  };

  const centering = isElementCentered(
    { x: element.x, y: element.y, ...elementSize },
    baseContainer
  );

  // Calculer les propriétés pour mobile avec le nouveau scaling
  const mobileScale = getDeviceScale(baseDevice, 'mobile');
  const mobileContainer = getDeviceDimensions('mobile');

  let mobileX, mobileY;

  // Si l'élément est centré, recalculer la position centrée
  if (centering.horizontal || centering.vertical) {
    const mobileSize = {
      width: elementSize.width * mobileScale.x,
      height: elementSize.height * mobileScale.y
    };

    const centeredPosition = calculateCenteredPosition(mobileContainer, mobileSize);

    mobileX = centering.horizontal ? centeredPosition.x : element.x * mobileScale.x;
    mobileY = centering.vertical ? centeredPosition.y : element.y * mobileScale.y;
  } else {
    mobileX = element.x * mobileScale.x;
    mobileY = element.y * mobileScale.y;
  }

  const mobileConfig: any = {
    x: Math.round(mobileX),
    y: Math.round(mobileY),
    width: element.width ? Math.round(element.width * mobileScale.x) : element.width,
    height: element.height ? Math.round(element.height * mobileScale.y) : element.height,
  };

  // Pour les textes, ajuster la taille de police
  if (element.type === 'text' && element.fontSize) {
    const minScale = Math.min(mobileScale.x, mobileScale.y);
    mobileConfig.fontSize = Math.max(12, Math.round(element.fontSize * minScale));
    
    // Si centré horizontalement, centrer le texte
    if (centering.horizontal) {
      mobileConfig.textAlign = 'center';
    }
  }

  // Calculer les propriétés pour tablette
  const tabletScale = getDeviceScale(baseDevice, 'tablet');
  const tabletContainer = getDeviceDimensions('tablet');

  let tabletX, tabletY;

  if (centering.horizontal || centering.vertical) {
    const tabletSize = {
      width: elementSize.width * tabletScale.x,
      height: elementSize.height * tabletScale.y
    };

    const centeredPosition = calculateCenteredPosition(tabletContainer, tabletSize);

    tabletX = centering.horizontal ? centeredPosition.x : element.x * tabletScale.x;
    tabletY = centering.vertical ? centeredPosition.y : element.y * tabletScale.y;
  } else {
    tabletX = element.x * tabletScale.x;
    tabletY = element.y * tabletScale.y;
  }

  const tabletConfig: any = {
    x: Math.round(tabletX),
    y: Math.round(tabletY),
    width: element.width ? Math.round(element.width * tabletScale.x) : element.width,
    height: element.height ? Math.round(element.height * tabletScale.y) : element.height,
  };

  if (element.type === 'text' && element.fontSize) {
    const minScale = Math.min(tabletScale.x, tabletScale.y);
    tabletConfig.fontSize = Math.max(12, Math.round(element.fontSize * minScale));
    
    if (centering.horizontal) {
      tabletConfig.textAlign = 'center';
    }
  }

  return {
    ...element,
    deviceConfig: {
      desktop: undefined, // Pas de config pour le device de base
      tablet: tabletConfig,
      mobile: mobileConfig,
    },
    isCentered: centering
  };
};

/**
 * Recalcule tous les éléments d'un tableau
 */
export const recalculateAllElements = (elements: Element[], baseDevice: DeviceType = 'desktop'): Element[] => {
  console.log(`🔄 Recalcul du scaling pour ${elements.length} éléments...`);
  
  const recalculated = elements.map(element => {
    const updated = recalculateElementScaling(element, baseDevice);
    console.log(`✅ Élément ${element.id} (${element.type}) recalculé`);
    return updated;
  });

  console.log(`✨ ${recalculated.length} éléments recalculés avec succès !`);
  return recalculated;
};

/**
 * Fonction utilitaire pour afficher les changements
 */
export const logScalingChanges = (oldElement: Element, newElement: Element) => {
  console.group(`📊 Changements pour ${oldElement.id}`);
  
  console.log('Avant (mobile):', {
    x: oldElement.deviceConfig?.mobile?.x,
    y: oldElement.deviceConfig?.mobile?.y,
    width: oldElement.deviceConfig?.mobile?.width,
    height: oldElement.deviceConfig?.mobile?.height,
  });
  
  console.log('Après (mobile):', {
    x: newElement.deviceConfig?.mobile?.x,
    y: newElement.deviceConfig?.mobile?.y,
    width: newElement.deviceConfig?.mobile?.width,
    height: newElement.deviceConfig?.mobile?.height,
  });
  
  if (oldElement.deviceConfig?.mobile?.width && newElement.deviceConfig?.mobile?.width) {
    const reduction = ((oldElement.deviceConfig.mobile.width - newElement.deviceConfig.mobile.width) / oldElement.deviceConfig.mobile.width * 100).toFixed(1);
    console.log(`📉 Réduction: ${reduction}%`);
  }
  
  console.groupEnd();
};

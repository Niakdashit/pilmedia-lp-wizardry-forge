// Unified device dimensions for the entire application
export const STANDARD_DEVICE_DIMENSIONS = {
  desktop: { width: 1700, height: 850 },
  tablet: { width: 820, height: 1180 }, // Plus réaliste: iPad Pro 11" (834x1194) avec ratio d'affichage 
  mobile: { width: 360, height: 640 }   // Format 9:16 mobile standardisé
} as const;

export type DeviceType = keyof typeof STANDARD_DEVICE_DIMENSIONS;

export const getDeviceDimensions = (device: DeviceType) => {
  return STANDARD_DEVICE_DIMENSIONS[device];
};

export const getDeviceScale = (fromDevice: DeviceType, toDevice: DeviceType) => {
  const from = STANDARD_DEVICE_DIMENSIONS[fromDevice];
  const to = STANDARD_DEVICE_DIMENSIONS[toDevice];
  
  return {
    x: to.width / from.width,
    y: to.height / from.height
  };
};

export const isElementCentered = (
  element: { x: number; y: number; width?: number; height?: number },
  container: { width: number; height: number },
  tolerance: number = 10
) => {
  const elementWidth = element.width || 100;
  const elementHeight = element.height || 30;
  
  const centerX = container.width / 2;
  const centerY = container.height / 2;
  
  const elementCenterX = element.x + elementWidth / 2;
  const elementCenterY = element.y + elementHeight / 2;
  
  const isHorizontallyCentered = Math.abs(elementCenterX - centerX) <= tolerance;
  const isVerticallyCentered = Math.abs(elementCenterY - centerY) <= tolerance;
  
  return {
    horizontal: isHorizontallyCentered,
    vertical: isVerticallyCentered,
    both: isHorizontallyCentered && isVerticallyCentered
  };
};

export const calculateCenteredPosition = (
  container: { width: number; height: number },
  elementSize: { width: number; height: number }
) => {
  return {
    x: (container.width - elementSize.width) / 2,
    y: (container.height - elementSize.height) / 2
  };
};

export const calculateCenteredTopPosition = (
  container: { width: number; height: number },
  elementSize: { width: number; height: number },
  topOffset: number = 50
) => {
  return {
    x: (container.width - elementSize.width) / 2,
    y: topOffset
  };
};

export const estimateTextWidth = (
  text: string,
  fontSize: number,
  fontWeight: string = 'normal',
  fontFamily: string = 'Open Sans'
) => {
  // Estimation approximative de la largeur du texte
  // Facteur de base pour la largeur des caractères
  let baseCharWidth = fontSize * 0.6; // Approximation générale
  
  // Ajustement selon le poids de la police
  if (fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900') {
    baseCharWidth *= 1.15; // Le texte en gras est environ 15% plus large
  }
  
  // Ajustement selon la famille de police (approximatif)
  if (fontFamily.includes('Condensed') || fontFamily.includes('Narrow')) {
    baseCharWidth *= 0.8;
  } else if (fontFamily.includes('Extended') || fontFamily.includes('Wide')) {
    baseCharWidth *= 1.2;
  }
  
  return Math.ceil(text.length * baseCharWidth);
};
import { useMemo } from 'react';

interface ResponsiveElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  // Position et tailles de base (desktop)
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  textAlign?: string;
  // Style et contenu
  style?: any;
  content?: string;
  // Configuration responsive automatique
  responsive?: {
    desktop: { x: number; y: number; width?: number; height?: number; fontSize?: number; textAlign?: string };
    tablet: { x: number; y: number; width?: number; height?: number; fontSize?: number; textAlign?: string };
    mobile: { x: number; y: number; width?: number; height?: number; fontSize?: number; textAlign?: string };
  };
}

interface ResponsiveDimensions {
  desktop: { width: number; height: number };
  tablet: { width: number; height: number };
  mobile: { width: number; height: number };
}

const DEVICE_DIMENSIONS: ResponsiveDimensions = {
  desktop: { width: 1200, height: 675 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 360, height: 640 }
};

/**
 * Hook pour gérer l'auto-responsiveness intelligente
 */
export const useAutoResponsive = (
  baseDevice: 'desktop' | 'tablet' | 'mobile' = 'desktop'
) => {
  
  /**
   * Détecte si un élément est centré intentionnellement
   */
  const isElementCentered = useMemo(() => {
    return (
      element: ResponsiveElement,
      container: { width: number; height: number },
      tolerance: number = 30
    ) => {
      const elementWidth = element.width || 200;
      const elementHeight = element.height || 50;
      
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
  }, []);

  /**
   * Calcule la position pour un élément centré
   */
  const calculateCenteredPosition = useMemo(() => {
    return (
      container: { width: number; height: number },
      elementWidth: number = 200,
      elementHeight: number = 50
    ) => {
      return {
        x: Math.round((container.width - elementWidth) / 2),
        y: Math.round((container.height - elementHeight) / 2)
      };
    };
  }, []);

  /**
   * Calcule les propriétés responsives intelligemment avec détection de centrage
   */
  const calculateResponsiveProperties = useMemo(() => {
    return (
      element: ResponsiveElement,
      targetDevice: 'desktop' | 'tablet' | 'mobile'
    ) => {
      if (targetDevice === baseDevice) {
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          fontSize: element.fontSize,
          textAlign: element.textAlign
        };
      }

      const baseContainer = DEVICE_DIMENSIONS[baseDevice];
      const targetContainer = DEVICE_DIMENSIONS[targetDevice];
      
      // Détecter si l'élément est centré sur l'appareil de base
      const centeringInfo = isElementCentered(element, baseContainer);
      
      // Calcul des ratios de transformation
      const widthRatio = targetContainer.width / baseContainer.width;
      const heightRatio = targetContainer.height / baseContainer.height;
      
      // Calcul intelligent de la taille de police
      const fontScaleRatio = (widthRatio * 0.7) + (heightRatio * 0.3);
      const newFontSize = element.fontSize ? Math.round(element.fontSize * fontScaleRatio) : undefined;
      
      // Calcul des dimensions adaptées
      const newWidth = element.width ? Math.round(element.width * widthRatio) : undefined;
      const newHeight = element.height ? Math.round(element.height * heightRatio) : undefined;
      
      let newX, newY;
      let textAlignment = element.textAlign;
      
      // Si l'élément est centré, le recentrer sur le nouvel appareil
      if (centeringInfo.both) {
        const centeredPos = calculateCenteredPosition(
          targetContainer, 
          newWidth || 200, 
          newHeight || 50
        );
        newX = centeredPos.x;
        newY = centeredPos.y;
        textAlignment = 'center'; // Forcer l'alignement centré
      } else if (centeringInfo.horizontal) {
        // Centrage horizontal uniquement
        const centeredPos = calculateCenteredPosition(
          targetContainer, 
          newWidth || 200, 
          newHeight || 50
        );
        newX = centeredPos.x;
        newY = Math.round((element.y / baseContainer.height) * targetContainer.height);
        textAlignment = 'center';
      } else if (centeringInfo.vertical) {
        // Centrage vertical uniquement
        const centeredPos = calculateCenteredPosition(
          targetContainer, 
          newWidth || 200, 
          newHeight || 50
        );
        newX = Math.round((element.x / baseContainer.width) * targetContainer.width);
        newY = centeredPos.y;
      } else {
        // Positionnement proportionnel normal
        newX = Math.round((element.x / baseContainer.width) * targetContainer.width);
        newY = Math.round((element.y / baseContainer.height) * targetContainer.height);
      }

      return {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        width: newWidth ? Math.max(50, newWidth) : undefined,
        height: newHeight ? Math.max(20, newHeight) : undefined,
        fontSize: newFontSize ? Math.max(10, Math.min(72, newFontSize)) : undefined,
        textAlign: textAlignment
      };
    };
  }, [baseDevice, isElementCentered, calculateCenteredPosition]);

  /**
   * Applique automatiquement la responsiveness à tous les éléments
   */
  const applyAutoResponsive = useMemo(() => {
    return (elementsToProcess: ResponsiveElement[]): ResponsiveElement[] => {
      return elementsToProcess.map(element => {
        const responsive = {
          desktop: calculateResponsiveProperties(element, 'desktop'),
          tablet: calculateResponsiveProperties(element, 'tablet'),
          mobile: calculateResponsiveProperties(element, 'mobile')
        };

        return {
          ...element,
          responsive
        };
      });
    };
  }, [calculateResponsiveProperties]);

  /**
   * Obtient les propriétés pour un appareil spécifique
   */
  const getPropertiesForDevice = useMemo(() => {
    return (
      element: ResponsiveElement,
      device: 'desktop' | 'tablet' | 'mobile'
    ) => {
      if (!element.responsive) {
        // Si pas de config responsive, calculer à la volée
        return calculateResponsiveProperties(element, device);
      }
      
      return element.responsive[device];
    };
  }, [calculateResponsiveProperties]);

  /**
   * Vérifie si un élément nécessite une adaptation
   */
  const needsAdaptation = useMemo(() => {
    return (element: ResponsiveElement, device: 'desktop' | 'tablet' | 'mobile'): boolean => {
      const props = getPropertiesForDevice(element, device);
      const containerDims = DEVICE_DIMENSIONS[device];
      
      // Vérifications de base
      const isOutOfBounds = 
        props.x < 0 || 
        props.y < 0 || 
        (props.x + (props.width || 0)) > containerDims.width ||
        (props.y + (props.height || 0)) > containerDims.height;
      
      const isTooSmall = 
        element.type === 'text' && 
        props.fontSize !== undefined && 
        props.fontSize < 12;
      
      return isOutOfBounds || isTooSmall;
    };
  }, [getPropertiesForDevice]);

  /**
   * Obtient des suggestions d'amélioration automatique
   */
  const getAdaptationSuggestions = useMemo(() => {
    return (elementsToCheck: ResponsiveElement[]) => {
      const suggestions: Array<{
        elementId: string;
        device: 'desktop' | 'tablet' | 'mobile';
        issue: string;
        suggestion: string;
      }> = [];

      elementsToCheck.forEach(element => {
        ['desktop', 'tablet', 'mobile'].forEach(device => {
          const deviceType = device as 'desktop' | 'tablet' | 'mobile';
          if (needsAdaptation(element, deviceType)) {
            const props = getPropertiesForDevice(element, deviceType);
            
            if (element.type === 'text' && props.fontSize && props.fontSize < 12) {
              suggestions.push({
                elementId: element.id,
                device: deviceType,
                issue: 'Texte trop petit',
                suggestion: `Augmenter la taille de police à ${Math.max(12, props.fontSize * 1.2)}px`
              });
            }
            
            const containerDims = DEVICE_DIMENSIONS[deviceType];
            if (props.x + (props.width || 0) > containerDims.width) {
              suggestions.push({
                elementId: element.id,
                device: deviceType,
                issue: 'Élément dépasse à droite',
                suggestion: 'Repositionner ou redimensionner l\'élément'
              });
            }
          }
        });
      });

      return suggestions;
    };
  }, [needsAdaptation, getPropertiesForDevice]);

  return {
    applyAutoResponsive,
    getPropertiesForDevice,
    calculateResponsiveProperties,
    needsAdaptation,
    getAdaptationSuggestions,
    DEVICE_DIMENSIONS
  };
};
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
  // Style et contenu
  style?: any;
  content?: string;
  // Configuration responsive automatique
  responsive?: {
    desktop: { x: number; y: number; width?: number; height?: number; fontSize?: number };
    tablet: { x: number; y: number; width?: number; height?: number; fontSize?: number };
    mobile: { x: number; y: number; width?: number; height?: number; fontSize?: number };
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
   * Calcule les propriétés responsives intelligemment
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
          fontSize: element.fontSize
        };
      }

      const baseContainer = DEVICE_DIMENSIONS[baseDevice];
      const targetContainer = DEVICE_DIMENSIONS[targetDevice];

      // Ratios de transformation intelligents
      const widthRatio = targetContainer.width / baseContainer.width;
      const heightRatio = targetContainer.height / baseContainer.height;

      // Position proportionnelle
      const xRatio = element.x / baseContainer.width;
      const yRatio = element.y / baseContainer.height;

      const newX = Math.round(xRatio * targetContainer.width);
      const newY = Math.round(yRatio * targetContainer.height);

      // Adaptation intelligente de la taille de police
      let fontSizeMultiplier = 1;
      if (element.type === 'text' && element.fontSize) {
        // Logique d'adaptation spécialisée par appareil
        switch (targetDevice) {
          case 'mobile':
            // Mobile : réduction modérée pour lisibilité
            fontSizeMultiplier = Math.max(0.7, widthRatio * 0.9);
            break;
          case 'tablet':
            // Tablette : légère adaptation
            fontSizeMultiplier = Math.max(0.8, widthRatio * 0.95);
            break;
          default:
            fontSizeMultiplier = widthRatio;
        }
      }

      const newFontSize = element.fontSize 
        ? Math.round(element.fontSize * fontSizeMultiplier)
        : undefined;

      // Dimensions adaptées
      const newWidth = element.width 
        ? Math.round(element.width * widthRatio) 
        : undefined;
      const newHeight = element.height 
        ? Math.round(element.height * heightRatio) 
        : undefined;

      return {
        x: Math.max(0, Math.min(newX, targetContainer.width - (newWidth || 50))),
        y: Math.max(0, Math.min(newY, targetContainer.height - (newHeight || 30))),
        width: newWidth,
        height: newHeight,
        fontSize: newFontSize ? Math.max(10, Math.min(72, newFontSize)) : undefined
      };
    };
  }, [baseDevice]);

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
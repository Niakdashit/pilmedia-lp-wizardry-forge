import { useMemo } from 'react';
import { 
  DeviceType, 
  getDeviceDimensions, 
  getDeviceScale, 
  isElementCentered, 
  calculateCenteredPosition 
} from '../utils/deviceDimensions';
import { 
  ResponsiveElement, 
  ResponsiveElementWithConfig, 
  ResponsiveCalculationResult,
  DeviceConfig 
} from '../types/responsive';

export const useUniversalResponsive = (baseDevice: DeviceType = 'desktop') => {
  
  const calculateResponsiveProperties = useMemo(() => {
    return (element: ResponsiveElement, targetDevice: DeviceType): ResponsiveElement => {
      if (targetDevice === baseDevice) {
        return element;
      }

      const baseContainer = getDeviceDimensions(baseDevice);
      const targetContainer = getDeviceDimensions(targetDevice);
      const scale = getDeviceScale(baseDevice, targetDevice);

      // Detect if element is centered on base device
      const elementSize = {
        width: element.width || (element.type === 'text' ? 200 : 100),
        height: element.height || (element.type === 'text' ? 40 : 100)
      };

      const centering = isElementCentered(
        { x: element.x, y: element.y, ...elementSize },
        baseContainer
      );

      let newX, newY, newWidth, newHeight, newFontSize;

      // If element is centered, recalculate center position for target device
      if (centering.horizontal || centering.vertical) {
        const targetSize = {
          width: elementSize.width * scale.x,
          height: elementSize.height * scale.y
        };

        const centeredPosition = calculateCenteredPosition(targetContainer, targetSize);

        newX = centering.horizontal ? centeredPosition.x : element.x * scale.x;
        newY = centering.vertical ? centeredPosition.y : element.y * scale.y;
      } else {
        // Standard scaling for non-centered elements
        newX = element.x * scale.x;
        newY = element.y * scale.y;
      }

      newWidth = element.width ? element.width * scale.x : undefined;
      newHeight = element.height ? element.height * scale.y : undefined;

      // Scale font size for text elements
      if (element.type === 'text' && 'fontSize' in element) {
        newFontSize = Math.max(12, Math.round(element.fontSize * Math.min(scale.x, scale.y)));
      }

      const responsiveElement: ResponsiveElement = {
        ...element,
        x: Math.round(newX),
        y: Math.round(newY),
        width: newWidth ? Math.round(newWidth) : element.width,
        height: newHeight ? Math.round(newHeight) : element.height
      };

      // Add responsive properties for text elements
      if (element.type === 'text' && newFontSize) {
        (responsiveElement as any).fontSize = newFontSize;
        // If element is centered, ensure text alignment is also centered
        if (centering.horizontal) {
          (responsiveElement as any).textAlign = 'center';
        }
      }

      return responsiveElement;
    };
  }, [baseDevice]);

  const applyAutoResponsive = useMemo(() => {
    return (elements: ResponsiveElement[]): ResponsiveElementWithConfig[] => {
      return elements.map(element => {
        const desktopProps = calculateResponsiveProperties(element, 'desktop');
        const tabletProps = calculateResponsiveProperties(element, 'tablet');
        const mobileProps = calculateResponsiveProperties(element, 'mobile');

        const baseContainer = getDeviceDimensions(baseDevice);
        const elementSize = {
          width: element.width || (element.type === 'text' ? 200 : 100),
          height: element.height || (element.type === 'text' ? 40 : 100)
        };
        const centering = isElementCentered(
          { x: element.x, y: element.y, ...elementSize },
          baseContainer
        );

        const deviceConfig: DeviceConfig = {
          desktop: baseDevice === 'desktop' ? undefined : {
            x: desktopProps.x,
            y: desktopProps.y,
            width: desktopProps.width,
            height: desktopProps.height,
            ...(element.type === 'text' ? { 
              fontSize: (desktopProps as any).fontSize,
              textAlign: (desktopProps as any).textAlign 
            } : {})
          },
          tablet: baseDevice === 'tablet' ? undefined : {
            x: tabletProps.x,
            y: tabletProps.y,
            width: tabletProps.width,
            height: tabletProps.height,
            ...(element.type === 'text' ? { 
              fontSize: (tabletProps as any).fontSize,
              textAlign: (tabletProps as any).textAlign 
            } : {})
          },
          mobile: baseDevice === 'mobile' ? undefined : {
            x: mobileProps.x,
            y: mobileProps.y,
            width: mobileProps.width,
            height: mobileProps.height,
            ...(element.type === 'text' ? { 
              fontSize: (mobileProps as any).fontSize,
              textAlign: (mobileProps as any).textAlign 
            } : {})
          }
        };

        return {
          ...element,
          deviceConfig,
          isCentered: centering
        } as ResponsiveElementWithConfig;
      });
    };
  }, [calculateResponsiveProperties, baseDevice]);

  const getPropertiesForDevice = useMemo(() => {
    return (element: ResponsiveElementWithConfig, device: DeviceType): any => {
      // Elements may store responsive overrides either in a dedicated
      // `deviceConfig` object or directly under a key matching the device
      // (e.g. `element.mobile`). Mobile specific coordinates were not
      // taken into account previously which caused dragged elements to snap
      // back to the left when switching viewpoint.
      const directProps = (element as any)[device];
      const configProps = element.deviceConfig?.[device];

      if (!directProps && !configProps) return element;

      return {
        ...element,
        ...(configProps || {}),
        ...(directProps || {})
      };
    };
  }, []);

  const needsAdaptation = useMemo(() => {
    return (element: ResponsiveElementWithConfig, device: DeviceType): boolean => {
      const container = getDeviceDimensions(device);
      const props = getPropertiesForDevice(element, device);
      
      // Check if element is out of bounds
      const isOutOfBounds = props.x < 0 || props.y < 0 || 
        props.x + (props.width || 100) > container.width ||
        props.y + (props.height || 30) > container.height;

      // Check if font is too small for text elements
      const hasTinyFont = props.type === 'text' && 
        'fontSize' in props && props.fontSize < 12;

      return isOutOfBounds || hasTinyFont;
    };
  }, [getPropertiesForDevice]);

  const getAdaptationSuggestions = useMemo(() => {
    return (elements: ResponsiveElementWithConfig[]): ResponsiveCalculationResult[] => {
      return elements.map(element => {
        const reasons: string[] = [];
        let needsAdapt = false;

        ['desktop', 'tablet', 'mobile'].forEach(device => {
          if (needsAdaptation(element, device as DeviceType)) {
            needsAdapt = true;
            reasons.push(`Needs adjustment on ${device}`);
          }
        });

        return {
          element,
          needsAdaptation: needsAdapt,
          adaptationReasons: reasons
        };
      });
    };
  }, [needsAdaptation]);

  return {
    calculateResponsiveProperties,
    applyAutoResponsive,
    getPropertiesForDevice,
    needsAdaptation,
    getAdaptationSuggestions,
    DEVICE_DIMENSIONS: { 
      desktop: getDeviceDimensions('desktop'),
      tablet: getDeviceDimensions('tablet'),
      mobile: getDeviceDimensions('mobile')
    }
  };
};
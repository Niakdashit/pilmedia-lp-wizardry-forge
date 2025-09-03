import { useMemo } from 'react';
import { useUniversalResponsive } from './useUniversalResponsive';
import { DeviceType, getDeviceDimensions } from '../utils/deviceDimensions';

// Legacy interface for compatibility
interface ResponsiveElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  textAlign?: string;
  style?: any;
  content?: string;
  responsive?: {
    desktop: { x: number; y: number; width?: number; height?: number; fontSize?: number; textAlign?: string };
    tablet: { x: number; y: number; width?: number; height?: number; fontSize?: number; textAlign?: string };
    mobile: { x: number; y: number; width?: number; height?: number; fontSize?: number; textAlign?: string };
  };
}

// Legacy compatibility - redirect to new universal system
const DEVICE_DIMENSIONS = {
  desktop: getDeviceDimensions('desktop'),
  tablet: getDeviceDimensions('tablet'),
  mobile: getDeviceDimensions('mobile')
} as const;

export const useAutoResponsive = (baseDevice: DeviceType = 'desktop') => {
  const universalResponsive = useUniversalResponsive(baseDevice);

  // Route-based guard: disable auto-appearance recognition inside editors only
  const disabled = typeof window !== 'undefined' && (() => {
    try {
      const p = window.location?.pathname || '';
      return p.startsWith('/design-editor') || p.startsWith('/template-editor') || p.startsWith('/quiz-editor');
    } catch {
      return false;
    }
  })();

  // Legacy compatibility wrapper
  const calculateResponsiveProperties = useMemo(() => {
    return (
      element: ResponsiveElement,
      targetDevice: DeviceType
    ): ResponsiveElement => {
      if (disabled) {
        // passthrough without auto adjustments
        return element;
      }
      const result = universalResponsive.calculateResponsiveProperties(element as any, targetDevice);
      return result as ResponsiveElement;
    };
  }, [universalResponsive, disabled]);

  // Legacy compatibility wrappers
  const applyAutoResponsive = useMemo(() => {
    return (elements: ResponsiveElement[]): ResponsiveElement[] => {
      if (disabled) {
        // passthrough; do not generate per-device configs automatically
        return elements;
      }
      const result = universalResponsive.applyAutoResponsive(elements as any);
      return result.map(el => el as ResponsiveElement);
    };
  }, [universalResponsive, disabled]);

  const getPropertiesForDevice = useMemo(() => {
    return (element: ResponsiveElement, device: DeviceType): ResponsiveElement => {
      if (disabled) {
        return element;
      }
      return universalResponsive.getPropertiesForDevice(element as any, device) as ResponsiveElement;
    };
  }, [universalResponsive, disabled]);

  const needsAdaptation = useMemo(() => {
    return (element: ResponsiveElement, device: DeviceType): boolean => {
      if (disabled) return false;
      return universalResponsive.needsAdaptation(element as any, device);
    };
  }, [universalResponsive, disabled]);

  const getAdaptationSuggestions = useMemo(() => {
    return (_elements: ResponsiveElement[]) => {
      // When disabled, provide no suggestions; otherwise defer to universal hook in future
      return [];
    };
  }, [universalResponsive, disabled]);

  return {
    applyAutoResponsive,
    getPropertiesForDevice,
    calculateResponsiveProperties,
    needsAdaptation,
    getAdaptationSuggestions,
    DEVICE_DIMENSIONS
  };
};
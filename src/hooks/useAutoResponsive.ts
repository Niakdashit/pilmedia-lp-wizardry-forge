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

  // Legacy compatibility wrapper
  const calculateResponsiveProperties = useMemo(() => {
    return (
      element: ResponsiveElement,
      targetDevice: DeviceType
    ): ResponsiveElement => {
      const result = universalResponsive.calculateResponsiveProperties(element as any, targetDevice);
      return result as ResponsiveElement;
    };
  }, [universalResponsive]);

  // Legacy compatibility wrappers
  const applyAutoResponsive = useMemo(() => {
    return (elements: ResponsiveElement[]): ResponsiveElement[] => {
      const result = universalResponsive.applyAutoResponsive(elements as any);
      return result.map(el => el as ResponsiveElement);
    };
  }, [universalResponsive]);

  const getPropertiesForDevice = useMemo(() => {
    return (element: ResponsiveElement, device: DeviceType): ResponsiveElement => {
      return universalResponsive.getPropertiesForDevice(element as any, device) as ResponsiveElement;
    };
  }, [universalResponsive]);

  const needsAdaptation = useMemo(() => {
    return (element: ResponsiveElement, device: DeviceType): boolean => {
      return universalResponsive.needsAdaptation(element as any, device);
    };
  }, [universalResponsive]);

  const getAdaptationSuggestions = useMemo(() => {
    return (_elements: ResponsiveElement[]) => {
      return []; // Return empty array for now to fix type error
    };
  }, [universalResponsive]);

  return {
    applyAutoResponsive,
    getPropertiesForDevice,
    calculateResponsiveProperties,
    needsAdaptation,
    getAdaptationSuggestions,
    DEVICE_DIMENSIONS
  };
};
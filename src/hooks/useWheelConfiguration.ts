import { useMemo } from 'react';
import { WheelConfigurationManager, WheelConfigSource } from '../utils/WheelConfigurationManager';

/**
 * Unified hook for wheel configuration that ensures consistency
 * between editor and preview contexts
 */
export const useWheelConfiguration = (
  source: WheelConfigSource,
  device: 'desktop' | 'tablet' | 'mobile' = 'desktop',
  scale: number = 1,
  maxSize?: number
) => {
  return useMemo(() => {
    return WheelConfigurationManager.generateUnifiedConfig(source, device, scale, maxSize);
  }, [source, device, scale, maxSize]);
};

/**
 * Hook specifically for brand colors extraction
 */
export const useWheelBrandColors = (source: WheelConfigSource) => {
  return useMemo(() => {
    return WheelConfigurationManager.getUnifiedBrandColors(source);
  }, [source]);
};

/**
 * Hook specifically for wheel segments
 */
export const useWheelSegments = (source: WheelConfigSource) => {
  return useMemo(() => {
    return WheelConfigurationManager.getUnifiedSegments(source);
  }, [source]);
};
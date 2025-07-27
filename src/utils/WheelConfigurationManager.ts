import { WheelSegment } from '../components/SmartWheel/types';

export interface WheelConfiguration {
  segments: WheelSegment[];
  size: number;
  borderStyle?: string;
  customBorderColor?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  customButton?: {
    text: string;
    color: string;
    textColor: string;
  };
  position?: { x: number; y: number; scale: number };
}

export interface WheelConfigSource {
  wheelSegments?: any[];
  segments?: any[];
  brandAssets?: any;
  customColors?: any;
  design?: any;
  config?: any;
  gameConfig?: any;
  buttonConfig?: any;
}

/**
 * Unified wheel configuration manager that ensures consistency
 * between editor and preview contexts
 */
export class WheelConfigurationManager {
  /**
   * Extract unified brand colors from various possible sources
   */
  static getUnifiedBrandColors(source: WheelConfigSource): { primary: string; secondary: string; accent?: string } {
    // Priority: customColors > brandAssets > design > config
    if (source.customColors) {
      return {
        primary: source.customColors.primary || '#ff6b6b',
        secondary: source.customColors.secondary || '#4ecdc4',
        accent: source.customColors.accent
      };
    }

    if (source.brandAssets) {
      return {
        primary: source.brandAssets.primaryColor || '#ff6b6b',
        secondary: source.brandAssets.secondaryColor || '#4ecdc4',
        accent: source.brandAssets.accentColor
      };
    }

    if (source.design?.customColors) {
      return {
        primary: source.design.customColors.primary || '#ff6b6b',
        secondary: source.design.customColors.secondary || '#4ecdc4',
        accent: source.design.customColors.accent
      };
    }

    if (source.config?.roulette) {
      return {
        primary: source.config.roulette.segmentColor1 || '#ff6b6b',
        secondary: source.config.roulette.segmentColor2 || '#4ecdc4'
      };
    }

    // Fallback defaults
    return {
      primary: '#ff6b6b',
      secondary: '#4ecdc4'
    };
  }

  /**
   * Extract unified wheel segments from various sources
   */
  static getUnifiedSegments(source: WheelConfigSource): WheelSegment[] {
    const brandColors = this.getUnifiedBrandColors(source);
    
    // Priority: wheelSegments > gameConfig.wheel.segments > config.roulette.segments
    let rawSegments = source.wheelSegments || 
                     source.gameConfig?.wheel?.segments ||
                     source.config?.roulette?.segments ||
                     source.segments ||
                     [];

    if (!rawSegments || rawSegments.length === 0) {
      return [];
    }

    return rawSegments.map((segment: any, index: number) => ({
      id: segment.id || `segment-${index}`,
      label: segment.label || `Segment ${index + 1}`,
      color: segment.color || (index % 2 === 0 ? brandColors.primary : brandColors.secondary),
      textColor: segment.textColor || '#ffffff',
      value: segment.value,
      icon: segment.icon,
      probability: segment.probability
    }));
  }

  /**
   * Calculate unified wheel size based on device and scale
   */
  static getUnifiedWheelSize(
    device: 'desktop' | 'tablet' | 'mobile', 
    scale: number = 1,
    maxSize?: number
  ): number {
    const baseSizes = {
      desktop: 400,
      tablet: 350,
      mobile: 280
    };

    const baseSize = baseSizes[device] || baseSizes.desktop;
    const scaledSize = baseSize * scale;
    
    if (maxSize) {
      return Math.min(scaledSize, maxSize);
    }
    
    return scaledSize;
  }

  /**
   * Get unified border configuration
   */
  static getUnifiedBorderConfig(source: WheelConfigSource) {
    return {
      borderStyle: source.design?.wheelBorderStyle || 'classic',
      customBorderColor: source.design?.wheelBorderColor || source.customColors?.primary
    };
  }

  /**
   * Get unified button configuration
   */
  static getUnifiedButtonConfig(source: WheelConfigSource) {
    const brandColors = this.getUnifiedBrandColors(source);
    
    return {
      text: source.buttonConfig?.text || 'Tourner',
      color: source.buttonConfig?.color || brandColors.accent || brandColors.primary,
      textColor: source.buttonConfig?.textColor || '#ffffff'
    };
  }

  /**
   * Generate complete unified wheel configuration
   */
  static generateUnifiedConfig(
    source: WheelConfigSource,
    device: 'desktop' | 'tablet' | 'mobile',
    scale: number = 1,
    maxSize?: number
  ): WheelConfiguration {
    return {
      segments: this.getUnifiedSegments(source),
      size: this.getUnifiedWheelSize(device, scale, maxSize),
      brandColors: this.getUnifiedBrandColors(source),
      customButton: this.getUnifiedButtonConfig(source),
      ...this.getUnifiedBorderConfig(source),
      position: source.gameConfig?.gamePosition || { x: 0, y: 0, scale }
    };
  }
}
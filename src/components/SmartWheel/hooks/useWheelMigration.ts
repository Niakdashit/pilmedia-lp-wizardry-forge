
import { useMemo } from 'react';
import { WheelSegment } from '../types';

interface LegacySegment {
  id?: string;
  label: string;
  color?: string;
  textColor?: string;
  probability?: number;
}

interface LegacyWheelConfig {
  segments?: LegacySegment[];
  buttonLabel?: string;
  speed?: string;
  mode?: string;
  winProbability?: number;
}

interface UseLegacyWheelMigrationProps {
  config?: LegacyWheelConfig;
  campaign?: any;
  brandColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
}

export const useWheelMigration = ({
  config,
  campaign,
  brandColors
}: UseLegacyWheelMigrationProps) => {
  const migratedSegments = useMemo<WheelSegment[]>(() => {
    // Récupérer les segments depuis différentes sources
    const segments = config?.segments || 
                    campaign?.gameConfig?.wheel?.segments ||
                    campaign?.config?.roulette?.segments || [];

    if (segments.length === 0) {
      // Segments par défaut si aucun configuré
      return [
        { id: '1', label: 'Prix 1', color: brandColors?.primary || '#ff6b6b' },
        { id: '2', label: 'Prix 2', color: brandColors?.secondary || '#4ecdc4' },
        { id: '3', label: 'Prix 3', color: brandColors?.accent || '#45b7d1' },
        { id: '4', label: 'Dommage', color: '#feca57' }
      ];
    }

    return segments.map((segment: LegacySegment, index: number) => ({
      id: segment.id || index.toString(),
      label: segment.label,
      color: segment.color || brandColors?.primary || '#d4dbe8',
      textColor: segment.textColor || '#ffffff',
      probability: segment.probability || 1
    }));
  }, [config, campaign, brandColors]);

  const migratedBrandColors = useMemo(() => ({
    primary: brandColors?.primary || campaign?.design?.customColors?.primary || '#d4dbe8',
    secondary: brandColors?.secondary || campaign?.design?.customColors?.secondary || '#4ecdc4',
    accent: brandColors?.accent || campaign?.design?.customColors?.accent || '#45b7d1'
  }), [brandColors, campaign]);

  const migratedButtonConfig = useMemo(() => ({
    text: config?.buttonLabel || 
          campaign?.gameConfig?.wheel?.buttonLabel || 
          'Faire tourner',
    color: migratedBrandColors.primary,
    textColor: '#ffffff'
  }), [config, campaign, migratedBrandColors]);

  return {
    segments: migratedSegments,
    brandColors: migratedBrandColors,
    buttonConfig: migratedButtonConfig,
    wheelConfig: {
      speed: config?.speed || 'medium',
      mode: config?.mode || 'random',
      winProbability: config?.winProbability || 0.1
    }
  };
};

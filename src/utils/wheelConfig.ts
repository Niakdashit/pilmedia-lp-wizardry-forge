
import { FieldConfig } from '../components/forms/DynamicContactForm';
import { SegmentManager } from '../services/SegmentManager';
import type { CampaignConfig } from '../types/PrizeSystem';

export const DEFAULT_FIELDS: FieldConfig[] = [
  { id: "civilite", label: "Civilité", type: "select", options: ["M.", "Mme"], required: false },
  { id: "prenom", label: "Prénom", required: true },
  { id: "nom", label: "Nom", required: true },
  { id: "email", label: "Email", type: "email", required: true }
];

export const DEFAULT_WHEEL_SEGMENTS = [
  { label: 'Prix 1', color: '#ff6b6b' },
  { label: 'Prix 2', color: '#4ecdc4' },
  { label: 'Prix 3', color: '#45b7d1' },
  { label: 'Prix 4', color: '#96ceb4' },
  { label: 'Dommage', color: '#feca57' },
  { label: 'Rejouer', color: '#ff9ff3' }
] as const;

/**
 * FONCTION PRINCIPALE - Utilise le nouveau système centralisé
 * Remplace l'ancienne logique complexe par un appel simple au SegmentManager
 */
export const getWheelSegments = (campaign: CampaignConfig) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🎯 getWheelSegments - Campaign:', campaign?.id);
  }

  // Utiliser le nouveau système centralisé
  const segments = SegmentManager.generateFinalSegments(campaign);
  
  // Contrainte tests: si segmentColor1 est défini côté config roulette,
  // forcer une alternance stricte [primary, white, primary, white, ...]
  // et un textColor contrasté (#ffffff sur primary, #111111 sur blanc)
  const primary = (campaign as any)?.config?.roulette?.segmentColor1 as string | undefined;
  if (primary && typeof primary === 'string' && primary.trim().length > 0) {
    const enforced = segments.map((s, idx) => {
      const color = idx % 2 === 0 ? primary : '#ffffff';
      const textColor = color.toLowerCase() === '#ffffff' ? '#111111' : '#ffffff';
      return { ...s, color, textColor } as typeof s;
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎯 getWheelSegments - Enforced colors from roulette.segmentColor1:', { primary, enforced });
    }
    return enforced;
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🎯 getWheelSegments - Segments finaux:', segments);
  }
  
  return segments;
};

export const getWheelDimensions = (
  gameDimensions: any,
  gamePosition: string,
  shouldCropWheel: boolean
) => {
  const baseCanvasSize = Math.min(gameDimensions.width, gameDimensions.height) - 60;
  const canvasSize = baseCanvasSize;
  const containerWidth =
    shouldCropWheel && (gamePosition === 'left' || gamePosition === 'right')
      ? baseCanvasSize * 0.5
      : baseCanvasSize;

  const containerHeight =
    shouldCropWheel && gamePosition === 'bottom' ? baseCanvasSize * 0.5 : baseCanvasSize;

  const pointerSize = Math.max(30, canvasSize * 0.08);

  return { canvasSize, containerWidth, containerHeight, pointerSize };
};

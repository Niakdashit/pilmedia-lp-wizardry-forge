
import { FieldConfig } from '../components/forms/DynamicContactForm';

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

export const getWheelSegments = (campaign: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('getWheelSegments - Campaign reçu:', campaign);
  }
  
  const segmentColor1 = campaign?.config?.roulette?.segmentColor1 || '#ff6b6b';
  const segmentColor2 = campaign?.config?.roulette?.segmentColor2 || '#4ecdc4';

  // Vérifier plusieurs sources pour les segments
  let originalSegments = 
    campaign?.gameConfig?.wheel?.segments || 
    campaign?.config?.roulette?.segments || 
    [];

  if (process.env.NODE_ENV !== 'production') {
    console.log('getWheelSegments - Segments trouvés:', originalSegments);
  }

  // Si aucun segment n'est trouvé, ne pas utiliser les segments par défaut
  // pour permettre l'affichage du message "Ajoutez des segments"
  if (!originalSegments || originalSegments.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('getWheelSegments - Aucun segment, retour tableau vide');
    }
    return [];
  }

  const segments = originalSegments.map((segment: any, index: number) => ({
    ...segment,
    color: segment.color || (index % 2 === 0 ? segmentColor1 : segmentColor2),
    textColor: segment.textColor || '#ffffff',
    id: segment.id || `segment-${index}`
  }));

  if (process.env.NODE_ENV !== 'production') {
    console.log('getWheelSegments - Segments finaux:', segments);
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

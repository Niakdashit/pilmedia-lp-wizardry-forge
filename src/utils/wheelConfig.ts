
import { FieldConfig } from '../components/forms/DynamicContactForm';

export const DEFAULT_FIELDS: FieldConfig[] = [
  { id: "civilite", label: "Civilité", type: "select", options: ["M.", "Mme"], required: false },
  { id: "prenom", label: "Prénom", required: true },
  { id: "nom", label: "Nom", required: true },
  { id: "email", label: "Email", type: "email", required: true }
];

export const getWheelSegments = (campaign: any) => {
  const segmentColor1 = campaign?.config?.roulette?.segmentColor1 || '#ff6b6b';
  const segmentColor2 = campaign?.config?.roulette?.segmentColor2 || '#4ecdc4';
  
  const originalSegments = campaign?.config?.roulette?.segments || [];
  return originalSegments.map((segment: any, index: number) => ({
    ...segment,
    color: index % 2 === 0 ? segmentColor1 : segmentColor2
  }));
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

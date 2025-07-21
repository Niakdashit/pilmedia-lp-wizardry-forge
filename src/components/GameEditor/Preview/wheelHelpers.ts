import type { EditorConfig } from '../GameEditorLayout';
import { DEFAULT_WHEEL_SEGMENTS } from '../../../utils/wheelConfig';

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  textColor?: string;
}

// Fonction pour calculer la couleur de texte contrastée
const getContrastingTextColor = (backgroundColor: string): string => {
  // Convertir la couleur hex en RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculer la luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retourner blanc pour les couleurs sombres, noir pour les couleurs claires
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const createSegments = (
  config: EditorConfig,
  brandColor: string
): WheelSegment[] => {
  const defaultLabels = DEFAULT_WHEEL_SEGMENTS.map(s => s.label);
  const labels = (config.wheelSegments?.map((s: any) => s.label) || defaultLabels).slice();

  if (labels.length % 2 !== 0) {
    labels.push(defaultLabels[labels.length % defaultLabels.length] || `Segment ${labels.length + 1}`);
  }

  return labels.map((label, idx) => {
    const segmentColor = idx % 2 === 0 ? brandColor : '#ffffff';
    return {
      id: String(idx + 1),
      label,
      color: segmentColor,
      textColor: getContrastingTextColor(segmentColor)
    };
  });
};

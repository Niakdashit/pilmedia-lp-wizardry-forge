import type { EditorConfig } from '../QualifioEditorLayout';
import { DEFAULT_WHEEL_SEGMENTS } from '../../../utils/wheelConfig';

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
}

export const createSegments = (
  config: EditorConfig,
  brandColor: string
): WheelSegment[] => {
  const defaultLabels = DEFAULT_WHEEL_SEGMENTS.map(s => s.label);
  const labels = (config.wheelSegments?.map((s: any) => s.label) || defaultLabels).slice();

  if (labels.length % 2 !== 0) {
    labels.push(defaultLabels[labels.length % defaultLabels.length] || `Segment ${labels.length + 1}`);
  }

  return labels.map((label, idx) => ({
    id: String(idx + 1),
    label,
    color: idx % 2 === 0 ? brandColor : '#ffffff'
  }));
};

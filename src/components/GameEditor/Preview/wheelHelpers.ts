export type WheelSegment = {
  id: string;
  label: string;
  value: string;
  color?: string;
  textColor?: string;
  image?: string;
  [key: string]: any;
};

export type WheelConfig = {
  wheelSegments?: WheelSegment[];
  [key: string]: any;
};

/**
 * Create a normalized, even-length list of wheel segments.
 * - Guarantees an even count (adds a duplicate of the last segment if needed)
 * - Alternates colors starting with brandColor, then #ffffff
 */
export function createSegments(config: WheelConfig, brandColor: string): WheelSegment[] {
  const base = (config?.wheelSegments ?? []).map((s, idx) => ({
    ...s,
    id: s.id || `segment-${idx}`,
    value: s.label || s.id || '',
    label: s.label || `Segment ${idx + 1}`
  }));

  if (base.length === 0) return [];

  // Ensure even number of segments by duplicating the last one if needed
  if (base.length % 2 !== 0) {
    const last = base[base.length - 1];
    base.push({ ...last });
  }

  const segments = base.map((seg, idx) => {
    const color = idx % 2 === 0 ? brandColor : '#ffffff';
    const merged: WheelSegment = {
      ...seg,
      id: seg.id,
      label: seg.label,
      value: seg.value || seg.label,
      color: color,
      textColor: seg.textColor || (idx % 2 === 0 ? '#ffffff' : '#111111')
    };
    return merged;
  });

  return segments;
}

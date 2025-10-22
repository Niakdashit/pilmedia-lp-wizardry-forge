export type WheelSegment = {
  label: string;
  id?: string;
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
  const base = (config?.wheelSegments ?? []).map((s) => ({ ...s }));

  if (base.length === 0) return [];

  // Ensure even number of segments by duplicating the last one if needed
  if (base.length % 2 !== 0) {
    const last = base[base.length - 1];
    base.push({ ...last });
  }

  const segments = base.map((seg, idx) => {
    const color = idx % 2 === 0 ? brandColor : '#ffffff';
    // Build stepwise to avoid duplicate literal keys
    const merged: WheelSegment = { ...seg };
    if (!merged.id) merged.id = `segment-${idx}`;
    if (!merged.label) merged.label = `Segment ${idx + 1}`;
    // enforce alternating colors for preview
    merged.color = color;
    if (!merged.textColor) {
      merged.textColor = idx % 2 === 0 ? '#ffffff' : '#111111';
    }
    return merged;
  });

  return segments;
}

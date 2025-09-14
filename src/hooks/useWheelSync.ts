import { useEffect, useMemo } from 'react';
import { useWheelStore, type WheelConfigState } from '../store/wheelStore';

export type WheelSyncInput = {
  campaignId?: string | number;
  segments?: any[];
  config?: Partial<WheelConfigState>;
  publish?: boolean; // if false, only consume the store without writing
};

function normalizeSegment(segment: any) {
  const hasImage = !!segment?.imageUrl || !!segment?.icon;
  const contentType = segment?.contentType || (hasImage ? 'image' : 'text');
  const imageUrl = segment?.imageUrl;
  const icon = contentType === 'image' && imageUrl ? imageUrl : segment?.icon;
  return {
    ...segment,
    contentType,
    imageUrl,
    icon,
  };
}

function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export function useWheelSync(input: WheelSyncInput) {
  const setSegments = useWheelStore((s) => s.setSegments);
  const setConfig = useWheelStore((s) => s.setConfig);
  const setCampaignId = useWheelStore((s) => s.setCampaignId);
  const publish = input.publish !== false; // default true

  const storeSegments = useWheelStore((s) => s.segments);
  const borderStyle = useWheelStore((s) => s.borderStyle);
  const borderColor = useWheelStore((s) => s.borderColor);
  const borderWidth = useWheelStore((s) => s.borderWidth);
  const showBulbs = useWheelStore((s) => s.showBulbs);
  const theme = useWheelStore((s) => s.theme);
  const size = useWheelStore((s) => s.size);
  const brandColors = useWheelStore((s) => s.brandColors);
  const storeConfig = useMemo(
    () => ({ borderStyle, borderColor, borderWidth, showBulbs, theme, size, brandColors }),
    [borderStyle, borderColor, borderWidth, showBulbs, theme, size, brandColors]
  );

  // Normalize inbound segments once for stable comparison
  const normalizedIncomingSegments = useMemo(() => {
    const arr = Array.isArray(input.segments) ? input.segments : [];
    return arr.map(normalizeSegment);
  }, [input.segments]);

  // Push inbound changes to store if different
  useEffect(() => {
    if (!publish) return;
    if (input.campaignId !== undefined) {
      setCampaignId(input.campaignId);
    }
  }, [publish, input.campaignId, setCampaignId]);

  useEffect(() => {
    if (!publish) return;
    const current = storeSegments;
    const sameLength = current.length === normalizedIncomingSegments.length;
    let differs = !sameLength;
    if (sameLength) {
      for (let i = 0; i < current.length; i++) {
        const a = current[i];
        const b = normalizedIncomingSegments[i];
        if (
          a?.id !== b?.id ||
          a?.label !== b?.label ||
          a?.color !== b?.color ||
          a?.textColor !== b?.textColor ||
          a?.probability !== b?.probability ||
          a?.prizeId !== b?.prizeId ||
          a?.contentType !== b?.contentType ||
          a?.imageUrl !== b?.imageUrl ||
          a?.icon !== b?.icon
        ) {
          differs = true;
          break;
        }
      }
    }
    if (differs && normalizedIncomingSegments.length > 0) {
      setSegments(normalizedIncomingSegments);
    }
  }, [publish, normalizedIncomingSegments, setSegments, storeSegments]);

  useEffect(() => {
    if (!publish) return;
    if (!input.config) return;
    const merged = { ...input.config };
    const same = shallowEqual(storeConfig, merged);
    if (!same) setConfig(merged);
  }, [publish, input.config, setConfig, storeConfig]);

  return {
    segments: storeSegments,
    config: storeConfig,
  };
}

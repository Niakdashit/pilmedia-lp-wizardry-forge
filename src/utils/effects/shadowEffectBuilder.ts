import { TextEffectModel, EffectLayer } from '../../types/TextEffectModel';

export interface ShadowControls {
  // UI ranges as per panel
  // Distance: 0..100 (default 50)
  // Angle: -180..180 (default -45)
  // Blur: 0..100 (default 0)
  // Transparency: 0..100 (default 40) -> 40% means 0.4 opacity
  distance: number;
  angle: number; // degrees
  blur: number; // 0..100 UI, mapped to px
  transparency: number; // 0..100, mapped to opacity 0..1
  color: string; // e.g. '#000000' or 'rgba(...)'
  // Optional: scaling knobs to match legacy CSS mapping
  distanceToPxScale?: number; // default: 0.1 -> 50 => 5px
  maxBlurPx?: number; // default: 40 -> blur:100 => 40px
}

/**
 * Build a single-layer TextEffectModel representing an outer shadow.
 * Defaults chosen to match the provided UI mock: Distance 50, Angle -45, Blur 0, Transparency 40, Color #000 (40%).
 */
export const createShadowEffectFromControls = (c: ShadowControls): TextEffectModel => {
  const distanceScale = c.distanceToPxScale ?? 0.1; // maps 50 => 5px like legacy panel
  const maxBlurPx = c.maxBlurPx ?? 40; // maps 100 => 40px

  const distancePx = Math.max(0, c.distance) * distanceScale;
  const rad = (c.angle * Math.PI) / 180;
  const x = Math.cos(rad) * distancePx;
  const y = Math.sin(rad) * distancePx; // positive is down in SVG, matching CSS text-shadow

  const blurPx = Math.round((Math.max(0, c.blur) / 100) * maxBlurPx);
  const opacity = Math.max(0, Math.min(1, c.transparency / 100));

  const layer: EffectLayer = {
    fill: { type: 'solid', color: '#000000', opacity: 1 },
    stroke: { enabled: false, color: '#000000', width: 0, opacity: 1, align: 'center' },
    shadows: [
      {
        enabled: true,
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        blur: blurPx,
        color: c.color,
        opacity
      }
    ],
    innerShadows: [],
    blendMode: 'normal',
    opacity: 1
  };

  return {
    version: 1,
    name: 'Shadow',
    layers: [layer]
  };
};

export const DEFAULT_SHADOW_CONTROLS: ShadowControls = {
  distance: 50,
  angle: -45,
  blur: 0,
  transparency: 40,
  color: '#000000',
  distanceToPxScale: 0.1,
  maxBlurPx: 40
};

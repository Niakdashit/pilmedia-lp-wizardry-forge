import { TextEffectModel, EffectLayer } from '../../types/TextEffectModel';

export interface ElevationControls {
  // UI-style controls 0..100
  // Strength maps to upward lift distance (0..6px) and shadow offset downwards accordingly
  strength: number; // 0..100, default 30 -> ~ -2px translate in CSS analogy
  blur: number; // 0..100, maps to 0..20px
  transparency: number; // 0..100 -> 0..1 opacity
  color: string; // hex or rgba
  // Optional scaling for fine-tuning
  maxLiftPx?: number; // default 6
  maxBlurPx?: number; // default 20
}

/**
 * Build a single-layer Elevation effect approximating a subtle lifted text with a soft shadow below.
 * This mirrors the previous CSS-based "Relief/Lift" mapping: translateY up and drop shadow below.
 * In the parametric model, we encode the visual via a downward shadow only (no transform in the model).
 */
export const createElevationEffectFromControls = (c: ElevationControls): TextEffectModel => {
  const maxLiftPx = c.maxLiftPx ?? 6;
  const maxBlurPx = c.maxBlurPx ?? 20;

  const liftPx = Math.round(((Math.max(0, Math.min(100, c.strength)) / 100) * maxLiftPx));
  const blurPx = Math.round(((Math.max(0, Math.min(100, c.blur)) / 100) * maxBlurPx));
  const opacity = Math.max(0, Math.min(1, c.transparency / 100));

  const layer: EffectLayer = {
    fill: { type: 'solid', color: '#000000', opacity: 1 },
    stroke: { enabled: false, color: '#000000', width: 0, opacity: 1, align: 'center' },
    shadows: [
      {
        enabled: true,
        x: 0,
        y: liftPx, // shadow cast directly below by the lift amount
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
    name: 'Elevation',
    layers: [layer]
  };
};

export const DEFAULT_ELEVATION_CONTROLS: ElevationControls = {
  strength: 30,
  blur: 20,
  transparency: 30,
  color: '#000000',
  maxLiftPx: 6,
  maxBlurPx: 20
};

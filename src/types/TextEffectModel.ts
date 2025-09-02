// Unified TextEffect model (parametric, layer-based)
// This model is renderer-agnostic and can be mapped to CSS, SVG, Canvas, or export pipelines.

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface ColorStop {
  color: string; // hex or rgba()
  offset?: number; // 0..1
}

export interface SolidFill {
  type: 'solid';
  color: string;
  opacity?: number; // 0..1
}

export interface LinearGradientFill {
  type: 'linear-gradient';
  angle?: number; // degrees
  stops: ColorStop[]; // at least 2
}

export type Fill = SolidFill | LinearGradientFill;

export interface Stroke {
  enabled: boolean;
  color: string;
  width: number; // px
  opacity?: number; // 0..1
  align?: 'center' | 'inside' | 'outside'; // renderer-dependent; SVG uses geometry, CSS mimics via text-shadow
}

export interface Shadow {
  enabled: boolean;
  x: number; // px
  y: number; // px
  blur: number; // px
  spread?: number; // reserved for future inside/outside
  color: string;
  opacity?: number; // 0..1
}

export interface InnerShadow extends Shadow {}

export interface Glow {
  enabled: boolean;
  color: string;
  opacity?: number; // 0..1
  blur: number; // px
  spread?: number; // px
}

export interface EffectLayer {
  // Logical order: fill -> stroke -> shadows/glows -> inner effects
  fill?: Fill; // default solid fill
  stroke?: Stroke; // optional
  shadows?: Shadow[]; // outer shadows (multiple)
  innerShadows?: InnerShadow[]; // inner shadows (future SVG filter)
  glow?: Glow; // outer glow (can be represented with drop shadow of 0,0)
  blendMode?: BlendMode;
  opacity?: number; // 0..1
}

export interface TextEffectModel {
  version: 1;
  name?: string;
  // For multi-layer styles (e.g., echo/splice/extrude) we can push multiple layers with offsets
  layers: EffectLayer[];
}

export const createDefaultTextEffect = (overrides: Partial<TextEffectModel> = {}): TextEffectModel => ({
  version: 1,
  layers: [
    {
      fill: { type: 'solid', color: '#000000', opacity: 1 },
      stroke: { enabled: false, color: '#000000', width: 0, opacity: 1, align: 'center' },
      shadows: [],
      innerShadows: [],
      glow: undefined,
      blendMode: 'normal',
      opacity: 1
    }
  ],
  ...overrides
});

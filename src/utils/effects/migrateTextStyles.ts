import type { TextStyleEffect } from '../../config/advancedTextStyles';
import type { TextEffectModel, EffectLayer, Fill } from '../../types/TextEffectModel';

// Lightweight parser helpers to migrate CSS-like presets to the parametric model

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));


const parseColor = (v: string | undefined): string | null => {
  if (!v) return null;
  return v.trim();
};

const parseWebkitTextStroke = (v: string | undefined): { width: number; color: string } | null => {
  if (!v) return null;
  // e.g. "2px #000" or "1.5px rgba(0,0,0,0.5)"
  const m = v.match(/([-+]?[0-9]*\.?[0-9]+)px\s+(.+)/);
  if (!m) return null;
  return { width: parseFloat(m[1]), color: m[2].trim() };
};

const parseTextShadow = (v: string | undefined) => {
  // Accept multi-shadows split by comma
  if (!v) return [] as Array<{ x: number; y: number; blur: number; color: string; opacity?: number }>;
  return v
    .split(',')
    .map(s => s.trim())
    .map(s => {
      // Format: "x y blur color"
      const parts = s.match(/([-+]?[0-9]*\.?[0-9]+)px\s+([-+]?[0-9]*\.?[0-9]+)px\s+([-+]?[0-9]*\.?[0-9]+)px\s+(.+)/);
      if (!parts) return null;
      const color = parts[4].trim();
      return {
        x: parseFloat(parts[1]),
        y: parseFloat(parts[2]),
        blur: parseFloat(parts[3]),
        color,
        opacity: undefined
      };
    })
    .filter(Boolean) as Array<{ x: number; y: number; blur: number; color: string; opacity?: number }>;
};

const parseLinearGradient = (prop: string | undefined): Fill | null => {
  if (!prop) return null;
  // linear-gradient(45deg, #a, #b, #c)
  const m = prop.match(/linear-gradient\(([^,]+),\s*(.+)\)/i);
  if (!m) return null;
  const rawAngle = m[1].trim();
  const stopsStr = m[2];
  let angle = 90;
  const angleMatch = rawAngle.match(/([-+]?[0-9]*\.?[0-9]+)deg/);
  if (angleMatch) angle = parseFloat(angleMatch[1]);
  const stops = stopsStr.split(',').map(s => ({ color: s.trim() }));
  if (stops.length < 2) return null;
  return {
    type: 'linear-gradient',
    angle,
    stops
  } as Fill;
};

export const migrateCssToTextEffect = (css: Record<string, any>): TextEffectModel => {
  const layers: EffectLayer[] = [];

  // Base layer
  const fill: Fill | undefined = (() => {
    // Prefer gradient if present
    const grad = parseLinearGradient(css.backgroundImage || css.background);
    if (grad) return grad;

    // If gradient via background-clip:text + transparent text fill is used, also rely on background
    if ((css.WebkitBackgroundClip === 'text' || css.backgroundClip === 'text') && (css.WebkitTextFillColor === 'transparent' || css.color === 'transparent')) {
      const grad2 = parseLinearGradient(css.backgroundImage || css.background);
      if (grad2) return grad2;
    }

    // Fallback to solid color
    const solidColor = parseColor(css.color) || '#000000';
    const opacity = typeof css.opacity === 'number' ? clamp01(css.opacity) : 1;
    return { type: 'solid', color: solidColor, opacity };
  })();

  const stroke = (() => {
    const parsed = parseWebkitTextStroke(css.WebkitTextStroke);
    if (!parsed) return undefined;
    return { enabled: true, color: parsed.color, width: parsed.width, opacity: 1, align: 'center' } as EffectLayer['stroke'];
  })();

  const shadows = parseTextShadow(css.textShadow);

  const layer: EffectLayer = {
    fill,
    stroke,
    shadows: shadows.length ? shadows.map(s => ({ enabled: true, ...s })) : [],
    innerShadows: [],
    glow: undefined,
    blendMode: 'normal',
    opacity: typeof css.opacity === 'number' ? clamp01(css.opacity) : 1
  };

  layers.push(layer);

  return {
    version: 1,
    name: undefined,
    layers
  };
};

export const migrateAdvancedStyles = (styles: TextStyleEffect[]) => {
  return styles.map(s => ({ id: s.id, name: s.name, model: migrateCssToTextEffect(s.css) }));
};

import React, { useMemo, useId } from 'react';
import type { TextEffectModel, EffectLayer } from '../../../types/TextEffectModel';

export interface SvgTextEffectRendererProps {
  text: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontFamily?: string;
  fontSize?: number; // px
  letterSpacing?: number;
  fontWeight?: number | string;
  model: TextEffectModel;
  // Optional accessibility and className
  role?: string;
  className?: string;
}

// Utility: build gradient defs for linear-gradient fills
const buildFillPaint = (
  layer: EffectLayer,
  uniqueKey: string
): { fillAttr: string; defs?: React.ReactNode } => {
  const fill = layer.fill;
  if (!fill) return { fillAttr: '#000' };

  if (fill.type === 'solid') {
    const opacity = fill.opacity == null ? 1 : fill.opacity;
    // Solid color applied via fill attribute and group opacity
    return { fillAttr: fill.color + (opacity < 1 ? '' : '') };
  }

  if (fill.type === 'linear-gradient') {
    const id = `lg-${uniqueKey}`;
    const angle = (fill.angle ?? 90) % 360;
    // Convert angle to x1,y1,x2,y2 (SVG uses vector from 0..1)
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad);
    const y = Math.sin(rad);
    const x1 = (0.5 - x / 2 + 0.5).toFixed(4);
    const y1 = (0.5 - y / 2 + 0.5).toFixed(4);
    const x2 = (0.5 + x / 2 + 0.5).toFixed(4);
    const y2 = (0.5 + y / 2 + 0.5).toFixed(4);

    const stops = (fill.stops && fill.stops.length >= 2)
      ? fill.stops
      : [{ color: '#000' }, { color: '#fff' }];

    const defs = (
      <defs>
        <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="objectBoundingBox">
          {stops.map((s, i) => (
            <stop key={i} offset={s.offset != null ? `${Math.round(s.offset * 100)}%` : `${Math.round((i / (stops.length - 1)) * 100)}%`} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
    );

    return { fillAttr: `url(#${id})`, defs };
  }

  return { fillAttr: '#000' };
};

const buildFilter = (layer: EffectLayer, uniqueKey: string) => {
  const shadows = (layer.shadows || []).filter(s => s.enabled);
  if (!shadows.length) return { filterId: undefined, defs: null };
  const id = `ds-${uniqueKey}`;
  return {
    filterId: id,
    defs: (
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          {shadows.map((sh, idx) => (
            <feDropShadow
              key={idx}
              dx={sh.x}
              dy={sh.y}
              stdDeviation={Math.max(0.01, sh.blur / 2)}
              floodColor={sh.color}
              floodOpacity={sh.opacity == null ? 1 : sh.opacity}
            />
          ))}
        </filter>
      </defs>
    )
  };
};

const buildStrokeAttrs = (layer: EffectLayer) => {
  if (!layer.stroke || !layer.stroke.enabled || layer.stroke.width <= 0) return {} as Record<string, any>;
  const s = layer.stroke;
  const opacity = s.opacity == null ? 1 : s.opacity;
  return {
    stroke: s.color,
    strokeWidth: s.width,
    strokeOpacity: opacity
  } as Record<string, any>;
};

export const SvgTextEffectRenderer: React.FC<SvgTextEffectRendererProps> = ({
  text,
  x = 0,
  y = 0,
  width = 800,
  height = 200,
  fontFamily = 'Open Sans, sans-serif',
  fontSize = 64,
  letterSpacing,
  fontWeight = 700,
  model,
  role,
  className
}) => {
  const rid = typeof useId === 'function' ? useId() : `rid-${Math.random().toString(36).slice(2)}`;

  // Ensure at least one layer
  const layers: EffectLayer[] = (model.layers && model.layers.length)
    ? model.layers
    : [
        {
          fill: { type: 'solid', color: '#000000', opacity: 1 },
          shadows: [],
          innerShadows: [],
          blendMode: 'normal',
          opacity: 1
        }
      ];

  // Prebuild defs per layer
  const built = useMemo(() => layers.map((layer, idx) => {
    const key = `${rid}-${idx}`;
    const fill = buildFillPaint(layer, key);
    const filter = buildFilter(layer, key);
    const stroke = buildStrokeAttrs(layer);
    const groupOpacity = layer.opacity == null ? 1 : layer.opacity;
    return { key, fill, filter, stroke, groupOpacity };
  }), [layers, rid]);

  // Vertical centering: use dominant-baseline for simplicity in scaffold
  const textY = y + height / 2;

  return (
    <svg
      className={className}
      role={role}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {built.map((b, i) => (
        <React.Fragment key={b.key}>
          {b.fill.defs}
          {b.filter.defs}
          <g opacity={b.groupOpacity} filter={b.filter.filterId ? `url(#${b.filter.filterId})` : undefined}>
            <text
              x={x + width / 2}
              y={textY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily={fontFamily}
              fontSize={fontSize}
              fontWeight={fontWeight}
              letterSpacing={letterSpacing}
              fill={b.fill.fillAttr}
              {...b.stroke}
            >
              {text}
            </text>
          </g>
        </React.Fragment>
      ))}
    </svg>
  );
};

export default SvgTextEffectRenderer;

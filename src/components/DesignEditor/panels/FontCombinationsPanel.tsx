import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { titlePresets, compositeTitlePresets } from '../../../config/titlePresets';
import { getDeviceDimensions, calculateCenteredPosition } from '../../../utils/deviceDimensions';

interface FontCombinationsPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

// Merge CSS style helpers (keeps cumulative props like textShadow and transform)
function mergeStyles(base: CSSProperties = {}, extra: CSSProperties = {}): CSSProperties {
  const merged: CSSProperties = { ...base, ...extra };
  const baseTS = (base as any).textShadow as string | undefined;
  const extraTS = (extra as any).textShadow as string | undefined;
  if (baseTS && extraTS) merged.textShadow = `${baseTS}, ${extraTS}`;
  const baseTr = (base as any).transform as string | undefined;
  const extraTr = (extra as any).transform as string | undefined;
  if (baseTr && extraTr) merged.transform = `${baseTr} ${extraTr}`;
  return merged;
}

const FontCombinationsPanel: React.FC<FontCombinationsPanelProps> = ({
  onAddElement,
  selectedElement,
  onElementUpdate,
  selectedDevice = 'desktop'
}) => {
  const [stackEffects, setStackEffects] = useState(false);

  const applyOrAddText = (preset?: any, stylePreset?: any) => {
    // If a text element is selected, apply changes to it (preserve fontSize)
    if (selectedElement && selectedElement.type === 'text' && onElementUpdate) {
      const updates: any = {};
      if (preset?.fontFamily) updates.fontFamily = preset.fontFamily;
      if (preset?.color) updates.color = preset.color;
      if (preset?.fontWeight) updates.fontWeight = preset.fontWeight;
      if (preset?.textAlign) updates.textAlign = preset.textAlign;
      if (typeof preset?.letterSpacing !== 'undefined') updates.letterSpacing = preset.letterSpacing;
      if (typeof preset?.lineHeight !== 'undefined') updates.lineHeight = preset.lineHeight;

      if (stylePreset) {
        const merged = stackEffects && selectedElement?.customCSS
          ? mergeStyles(selectedElement.customCSS as CSSProperties, stylePreset.style as CSSProperties)
          : stylePreset.style;
        updates.customCSS = merged;
        updates.advancedStyle = {
          id: stylePreset.id,
          name: stylePreset.name,
          category: 'preset',
          css: merged
        };
      }

      onElementUpdate(updates);
      return;
    }

    // Otherwise create a new styled text element
    const newElement: any = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: preset?.text || stylePreset?.text || 'Texte',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      fontSize: preset?.fontSize || 24,
      color: preset?.color || '#000000',
      fontFamily: preset?.fontFamily || 'Inter',
      fontWeight: preset?.fontWeight || 'normal',
      textAlign: preset?.textAlign || 'left',
      ...(typeof preset?.letterSpacing !== 'undefined' ? { letterSpacing: preset.letterSpacing } : {}),
      ...(typeof preset?.lineHeight !== 'undefined' ? { lineHeight: preset.lineHeight } : {}),
      ...(stylePreset && {
        customCSS: stylePreset.style,
        advancedStyle: {
          id: stylePreset.id,
          name: stylePreset.name,
          category: 'preset',
          css: stylePreset.style
        }
      })
    };

    // Pre-center for mobile canvas when adding from desktop
    if (selectedDevice === 'desktop') {
      const mobileCanvas = getDeviceDimensions('mobile');
      const defaultTextSize = { width: 200, height: 40 };
      const centered = calculateCenteredPosition(mobileCanvas, defaultTextSize);
      newElement.mobile = {
        ...(newElement.mobile || {}),
        x: centered.x,
        y: centered.y
      };
    }

    onAddElement(newElement);
  };

  const insertComposite = (composite: any) => {
    const baseX = Math.random() * 400 + 100;
    const baseY = Math.random() * 300 + 100;
    const layers = [...(composite?.layers || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    layers.forEach((layer: any, idx: number) => {
      const el: any = {
        id: `text-${Date.now()}-${idx}`,
        type: 'text',
        content: layer.text || composite.sample || 'Texte',
        x: baseX + (layer.offsetX || 0),
        y: baseY + (layer.offsetY || 0),
        fontSize: layer?.preset?.fontSize || 24,
        color: layer?.preset?.color || '#000000',
        fontFamily: layer?.preset?.fontFamily || 'Inter',
        fontWeight: layer?.preset?.fontWeight || 'normal',
        textAlign: layer?.preset?.textAlign || 'left',
        ...(typeof layer?.preset?.letterSpacing !== 'undefined' ? { letterSpacing: layer.preset.letterSpacing } : {}),
        ...(typeof layer?.preset?.lineHeight !== 'undefined' ? { lineHeight: layer.preset.lineHeight } : {}),
        ...(layer?.stylePreset && {
          customCSS: layer.stylePreset.style,
          advancedStyle: {
            id: layer.stylePreset.id,
            name: layer.stylePreset.name,
            category: 'preset',
            css: layer.stylePreset.style
          }
        })
      };

      if (selectedDevice === 'desktop') {
        const mobileCanvas = getDeviceDimensions('mobile');
        const defaultTextSize = { width: 200, height: 40 };
        const centered = calculateCenteredPosition(mobileCanvas, defaultTextSize);
        el.mobile = {
          ...(el.mobile || {}),
          x: centered.x,
          y: centered.y
        };
      }

      onAddElement(el);
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Combinaisons de polices</h3>
        <p className="text-sm text-muted-foreground">Appliquez des paires de polices et effets prêts à l'emploi</p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={stackEffects}
            onChange={(e) => setStackEffects(e.target.checked)}
          />
          Empiler les effets lors de l'application sur un texte existant
        </label>
      </div>

      {/* Simple templates */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Templates</h4>
        <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto">
          {titlePresets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyOrAddText({ ...p.preset, text: p.sample }, p.stylePreset)}
              className="p-3 border border-gray-200 rounded hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors text-left group"
            >
              <div
                className="text-2xl font-bold leading-tight group-hover:text-white"
                style={{
                  fontFamily: p.preset.fontFamily,
                  fontWeight: p.preset.fontWeight as any,
                  color: p.preset.color as any,
                  letterSpacing: p.preset.letterSpacing as any,
                  lineHeight: p.preset.lineHeight as any,
                  textAlign: p.preset.textAlign as any,
                  ...(p.stylePreset?.style || {})
                }}
              >
                {p.sample}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-white">{p.name} • {p.preset.fontFamily}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Composite multi-layer templates */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Composites</h4>
        <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto">
          {compositeTitlePresets.map((p) => (
            <button
              key={p.id}
              onClick={() => insertComposite(p)}
              className="p-3 border border-gray-200 rounded hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors text-left group"
            >
              <div className="relative h-16">
                {p.layers.map((layer: any, idx: number) => (
                  <div
                    key={idx}
                    className="absolute"
                    style={{
                      left: (layer.offsetX || 0),
                      top: (layer.offsetY || 0),
                      fontSize: `${layer.preset.fontSize}px`,
                      fontFamily: layer.preset.fontFamily,
                      fontWeight: layer.preset.fontWeight as any,
                      color: layer.preset.color as any,
                      letterSpacing: layer.preset.letterSpacing as any,
                      lineHeight: layer.preset.lineHeight as any,
                      textAlign: layer.preset.textAlign as any,
                      ...(layer.stylePreset?.style || {})
                    }}
                  >
                    {layer.text || p.sample}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1 group-hover:text-white">{p.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FontCombinationsPanel;

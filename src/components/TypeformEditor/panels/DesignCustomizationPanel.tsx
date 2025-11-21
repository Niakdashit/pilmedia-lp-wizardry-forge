import React from 'react';
import { fontOptions } from '@/config/fonts';

interface DesignCustomizationPanelProps {
  primaryColor: string;
  fontFamily: string;
  onPrimaryColorChange: (color: string) => void;
  onFontFamilyChange: (font: string) => void;
}

// Génère 3 teintes à partir d'une couleur principale
const generateColorShades = (baseColor: string) => {
  // Convertir hex en HSL
  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Convertir HSL en hex
  const hslToHex = (h: number, s: number, l: number) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hsl = hexToHSL(baseColor);
  
  return {
    dark: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 25, 10)),
    medium: baseColor,
    light: hslToHex(hsl.h, Math.max(hsl.s - 15, 20), Math.min(hsl.l + 30, 90))
  };
};

const DesignCustomizationPanel: React.FC<DesignCustomizationPanelProps> = ({
  primaryColor,
  fontFamily,
  onPrimaryColorChange,
  onFontFamilyChange
}) => {
  const shades = generateColorShades(primaryColor);

  // Couleurs prédéfinies inspirées de designs populaires
  const presetColors = [
    { name: 'Purple', value: '#841b60' },
    { name: 'Orange', value: '#d4a574' },
    { name: 'Blue', value: '#4a90e2' },
    { name: 'Green', value: '#50c878' },
    { name: 'Pink', value: '#ff6b9d' },
    { name: 'Teal', value: '#008b8b' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Indigo', value: '#6366f1' },
  ];

  // Polices populaires
  const popularFonts = fontOptions.filter(f => 
    ['Inter', 'Playfair Display', 'Montserrat', 'Lobster', 'Oswald', 'Raleway', 'Poppins', 'Dancing Script'].includes(f.label)
  );

  return (
    <div className="p-4 space-y-6">
      {/* Sélection de la couleur principale */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">COULEUR PRINCIPALE</h3>
        
        {/* Sélecteur de couleur personnalisée */}
        <div className="mb-4">
          <label className="block text-xs text-gray-600 mb-2">Couleur personnalisée</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        {/* Palette prédéfinie */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">Couleurs prédéfinies</label>
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => onPrimaryColorChange(color.value)}
                className={`w-full h-12 rounded-lg border-2 transition-all ${
                  primaryColor.toLowerCase() === color.value.toLowerCase()
                    ? 'border-gray-900 scale-95'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Aperçu des 3 teintes */}
        <div className="mt-4">
          <label className="block text-xs text-gray-600 mb-2">Aperçu des teintes</label>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <div 
                className="h-12 rounded-lg border border-gray-200"
                style={{ backgroundColor: shades.dark }}
              />
              <p className="text-xs text-center text-gray-600">Foncée</p>
            </div>
            <div className="flex-1 space-y-1">
              <div 
                className="h-12 rounded-lg border border-gray-200"
                style={{ backgroundColor: shades.medium }}
              />
              <p className="text-xs text-center text-gray-600">Moyenne</p>
            </div>
            <div className="flex-1 space-y-1">
              <div 
                className="h-12 rounded-lg border border-gray-200"
                style={{ backgroundColor: shades.light }}
              />
              <p className="text-xs text-center text-gray-600">Claire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sélection de la police */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">POLICE DE CARACTÈRES</h3>
        
        <select
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        >
          <optgroup label="Polices populaires">
            {popularFonts.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Toutes les polices">
            {fontOptions
              .filter(f => !popularFonts.some(pf => pf.value === f.value))
              .map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
          </optgroup>
        </select>

        {/* Aperçu de la police */}
        <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white">
          <p 
            className="text-xl"
            style={{ fontFamily }}
          >
            Build striking branded forms
          </p>
          <p 
            className="text-sm text-gray-600 mt-2"
            style={{ fontFamily }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignCustomizationPanel;

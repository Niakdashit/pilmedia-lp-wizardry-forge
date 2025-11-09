import React, { useRef, useState, useMemo } from 'react';
import { Upload, Pipette } from 'lucide-react';
import ColorThief from 'colorthief';

interface BackgroundPanelProps {
  onBackgroundChange: (background: { type: 'color' | 'image'; value: string }, options?: { screenId?: 'screen1' | 'screen2' | 'screen3'; applyToAllScreens?: boolean; device?: 'desktop' | 'tablet' | 'mobile' }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[];
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  // 'fill' applies text color or shape background; 'border' applies shape borderColor
  colorEditingContext?: 'fill' | 'border' | 'text';
  // Current modular screen to target per-screen background application
  currentScreen?: 'screen1' | 'screen2' | 'screen3';
  // Current editor device to scope backgrounds per device (desktop/tablet/mobile)
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ 
  onBackgroundChange, 
  onExtractedColorsChange,
  currentBackground,
  extractedColors = [],
  selectedElement,
  onElementUpdate,
  colorEditingContext = 'fill',
  currentScreen,
  selectedDevice
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [customColor, setCustomColor] = useState('#FF0000');
  // Option: appliquer l'image de fond à tous les écrans (desktop/tablette/mobile)
  const [applyToAllScreens, setApplyToAllScreens] = useState<boolean>(false);

  // Vérifier si un élément est sélectionné
  const isTextSelected = selectedElement && selectedElement.type === 'text';
  const isShapeSelected = selectedElement && selectedElement.type === 'shape';
  
  // Déterminer la couleur actuelle en fonction de la sélection et du contexte
  const getCurrentColor = () => {
    if (isTextSelected) {
      if (colorEditingContext === 'border') {
        // Texte peut ne pas avoir de bordure; fallback à la couleur du texte si absent
        return selectedElement.borderColor || selectedElement.color || '#000000';
      }
      return selectedElement.color || '#000000';
    }
    if (isShapeSelected) {
      if (colorEditingContext === 'border') {
        return selectedElement.borderColor || '#000000';
      }
      if (colorEditingContext === 'text') {
        return selectedElement.textColor || '#000000';
      }
      return selectedElement.backgroundColor || '#3B82F6';
    }
    return currentBackground?.type === 'color' ? currentBackground.value : undefined;
  };

  // Fonction pour appliquer une couleur
  const applyColor = (color: string) => {
    if (isTextSelected && onElementUpdate) {
      // Texte: bordure optionnelle, sinon couleur du texte
      if (colorEditingContext === 'border') {
        onElementUpdate({ borderColor: color });
      } else {
        onElementUpdate({ color });
      }
    } else if (isShapeSelected && onElementUpdate) {
      // Forme: selon le contexte
      if (colorEditingContext === 'border') {
        onElementUpdate({ borderColor: color });
      } else if (colorEditingContext === 'text') {
        onElementUpdate({ textColor: color });
      } else {
        onElementUpdate({ backgroundColor: color });
      }
    } else {
      // Appliquer à l'arrière-plan (toujours fill)
      onBackgroundChange(
        { type: 'color', value: color },
        {
          screenId: currentScreen,
          applyToAllScreens: applyToAllScreens,
          device: selectedDevice
        }
      );
    }
  };

  // La fonction getCurrentColor() est utilisée directement dans le rendu

  const backgroundColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C69', '#87CEEB', '#98FB98'
  ];

  // Helpers pour filtrer les couleurs extraites
  const parseRgb = (s: string) => {
    const m = String(s).match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  };

  const toHslHelper = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h, s, l };
  };

  const filterColorsUI = (arr: string[] = []) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of arr) {
      const rgb = parseRgb(c);
      if (!rgb) continue;
      const { s, l } = toHslHelper(rgb.r, rgb.g, rgb.b);
      if (l < 0.06 || l > 0.95) continue;
      if (s < 0.1) continue;
      const key = `${rgb.r}-${rgb.g}-${rgb.b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      if (out.length >= 8) break;
    }
    return out;
  };

  const displayedExtracted = useMemo<string[]>(() => filterColorsUI(extractedColors), [extractedColors]);

  // Gérer le changement de la checkbox
  const handleApplyToAllScreensChange = (checked: boolean) => {
    setApplyToAllScreens(checked);
    
    // Si on décoche, supprimer les images des autres écrans pour le device courant
    if (!checked && typeof window !== 'undefined' && selectedDevice) {
      const evt = new CustomEvent('clearBackgroundOtherScreens', { 
        detail: { 
          device: selectedDevice, 
          keepScreenId: currentScreen 
        } 
      });
      window.dispatchEvent(evt);
    }
  };

  const extractColorsFromImage = async (imageUrl: string) => {
    const fallbackViaCanvas = (img: HTMLImageElement): string[] => {
      try {
        const maxW = 200;
        const scale = Math.min(1, maxW / Math.max(1, img.naturalWidth || img.width || maxW));
        const w = Math.max(1, Math.round((img.naturalWidth || img.width || maxW) * scale));
        const h = Math.max(1, Math.round((img.naturalHeight || img.height || maxW) * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
        if (!ctx) return [];
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        
        // Helper: RGB -> HSL
        const toHsl = (r: number, g: number, b: number) => {
          r /= 255; g /= 255; b /= 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h = 0, s = 0;
          const l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return { h, s, l };
        };
        
        // Quantize by reducing color resolution to 4-bit per channel (0..15), but skip dull/near-black/near-white
        const buckets: Record<string, number> = {};
        const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 20000))); // sample ~20k pixels max
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const i = (y * w + x) * 4;
            const a = data[i + 3];
            if (a < 16) continue; // skip transparent
            const r = data[i], g = data[i + 1], b = data[i + 2];
            // Filter near-black or near-white and very low saturation colors
            const { s, l } = toHsl(r, g, b);
            if (l < 0.06 || l > 0.96) continue;
            if (s < 0.1) continue;
            const R = (r >> 4), G = (g >> 4), B = (b >> 4);
            const key = `${R}-${G}-${B}`;
            buckets[key] = (buckets[key] || 0) + 1;
          }
        }
        const entries = Object.entries(buckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([key]) => {
            const [R, G, B] = key.split('-').map(n => parseInt(n, 10));
            return `rgb(${R * 17}, ${G * 17}, ${B * 17})`;
          });
        return entries;
      } catch {
        return [];
      }
    };

    return new Promise<string[]>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          let palette: number[][] = [];
          try {
            palette = colorThief.getPalette(img, 8) || [];
          } catch {}

          let colors = (palette || []).map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
          const tooDarkCount = colors.filter(c => /rgb\((\s*0\s*,){2}\s*0\s*\)/.test(c)).length;
          if (colors.length === 0 || tooDarkCount >= Math.max(3, Math.floor(colors.length / 2))) {
            // Fallback if ColorThief failed or returned mostly black
            colors = fallbackViaCanvas(img);
          }
          
          // Final filter: remove near-black/near-white/low-saturation and deduplicate
          const toRgb = (s: string) => {
            const m = s.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (!m) return null;
            return { r: +m[1], g: +m[2], b: +m[3] };
          };
          const toKey = (r: number, g: number, b: number) => `${r}-${g}-${b}`;
          const toHsl = (r: number, g: number, b: number) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
              switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
              }
              h /= 6;
            }
            return { h, s, l };
          };
          const seen = new Set<string>();
          const filtered = colors.reduce<string[]>((acc, c) => {
            const rgb = toRgb(c);
            if (!rgb) return acc;
            const { s, l } = toHsl(rgb.r, rgb.g, rgb.b);
            if (l < 0.06 || l > 0.95) return acc;
            if (s < 0.1) return acc;
            const key = toKey(rgb.r, rgb.g, rgb.b);
            if (seen.has(key)) return acc;
            seen.add(key);
            acc.push(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
            return acc;
          }, []);
          resolve(filtered.slice(0, 8));
        } catch (error) {
          console.warn('ColorThief failed, using canvas fallback', error);
          resolve(fallbackViaCanvas(img));
        }
      };
      img.onerror = () => resolve([]);
      img.src = imageUrl;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validation de fichier (taille max 10MB, formats acceptés)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (file.size > maxSize) {
        alert('Le fichier est trop volumineux. Taille maximale: 10MB');
        return;
      }
      
      if (!acceptedFormats.includes(file.type)) {
        alert('Format de fichier non supporté. Formats acceptés: JPG, PNG, GIF, WebP');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        // Appliquer l'image via le callback avec les options appropriées
        onBackgroundChange(
          { type: 'image', value: imageUrl },
          {
            screenId: currentScreen,
            applyToAllScreens: applyToAllScreens,
            device: selectedDevice
          }
        );
        
        // Extract colors from the uploaded image (toujours extraire les couleurs)
        const extracted = await extractColorsFromImage(imageUrl);
        if (onExtractedColorsChange && extracted.length > 0) {
          onExtractedColorsChange(extracted);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerColorPicker = () => {
    colorInputRef.current?.click();
  };

  const handleCustomColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setCustomColor(newColor);
    applyColor(newColor);
  };

  return (
    <div className="p-4 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="sr-only"
      />
      
      <input
        ref={colorInputRef}
        type="color"
        value={customColor}
        onChange={handleCustomColorChange}
        className="sr-only"
      />

      {/* Indicateur de ce qui sera modifié */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800 font-medium">
          {isTextSelected ? (
            <>
              📝 Modification du texte sélectionné
              <span className="block text-xs text-blue-600 mt-1">
                {colorEditingContext === 'border' 
                  ? 'Les couleurs seront appliquées à la bordure du texte (si supportée)'
                  : `Les couleurs seront appliquées au texte "${selectedElement.text || 'Texte'}"`}
              </span>
            </>
          ) : (
            <>
              {isShapeSelected ? '⬛ Modification de la forme sélectionnée' : '🖼️ Modification de l\'arrière-plan'}
              <span className="block text-xs text-blue-600 mt-1">
                {isShapeSelected
                  ? (colorEditingContext === 'border' 
                      ? 'Les couleurs seront appliquées à la bordure de la forme'
                      : 'Les couleurs seront appliquées au remplissage de la forme')
                  : 'Les couleurs seront appliquées à l\'arrière-plan du design'}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Upload Background Image - Seulement si pas de texte sélectionné */}
      {!isTextSelected && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">IMAGE DE FOND</h3>
          <button
            onClick={triggerFileUpload}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[#44444d] hover:text-white transition-colors flex flex-col items-center group"
          >
            <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
            <span className="text-sm text-gray-600 group-hover:text-white">Télécharger une image</span>
            <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG, GIF, WebP jusqu'à 10MB</span>
          </button>
          
          {/* Checkbox pour appliquer à tous les écrans/devices */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="apply-to-all-screens"
              checked={applyToAllScreens}
              onChange={(e) => handleApplyToAllScreensChange(e.target.checked)}
              className="w-4 h-4 text-[#44444d] border-gray-300 rounded focus:ring-[#44444d]"
            />
            <label htmlFor="apply-to-all-screens" className="text-xs text-gray-600 cursor-pointer">
              {currentScreen 
                ? `Appliquer à tous les écrans (${selectedDevice || 'desktop'})`
                : `Appliquer à tous les appareils (Desktop/Tablette/Mobile)`
              }
            </label>
          </div>
        </div>
      )}

      {/* Solid Colors */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">
          {isShapeSelected
            ? (colorEditingContext === 'border' ? 'COULEURS DE BORDURE' : 'COULEURS DE REMPLISSAGE')
            : (isTextSelected
                ? (colorEditingContext === 'border' ? 'COULEURS DE BORDURE (TEXTE)' : 'COULEURS DE TEXTE')
                : 'COULEURS UNIES')}
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {/* Sélecteur de couleur personnalisé en première position */}
          <button
            onClick={triggerColorPicker}
            className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors relative overflow-hidden"
            style={{
              background: `conic-gradient(from 0deg, #ff0000 0deg, #ffff00 60deg, #00ff00 120deg, #00ffff 180deg, #0000ff 240deg, #ff00ff 300deg, #ff0000 360deg)`
            }}
            title="Couleur personnalisée"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Pipette className="w-3 h-3 text-gray-700" />
              </div>
            </div>
          </button>
          
          {backgroundColors.map((color, index) => (
            <button
              key={index}
              onClick={() => applyColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-colors relative ${
                getCurrentColor() === color 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            >
              {color === '#FFFFFF' && (
                <div className="absolute inset-0 border border-gray-300 rounded-full"></div>
              )}
              {getCurrentColor() === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Colors - Utilise displayedExtracted pour filtrer les couleurs */}
      {displayedExtracted.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">COULEURS EXTRAITES</h3>
          <div className="grid grid-cols-5 gap-2">
            {displayedExtracted.map((color, index) => (
              <button
                key={index}
                onClick={() => applyColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-colors relative group ${
                  getCurrentColor() === color 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-opacity"></div>
                {getCurrentColor() === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundPanel;
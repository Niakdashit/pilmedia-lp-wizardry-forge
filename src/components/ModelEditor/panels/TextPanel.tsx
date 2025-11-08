import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Type } from 'lucide-react';
import TextEffectsPanel from './TextEffectsPanel';
import { titlePresets, compositeTitlePresets } from '../../../config/titlePresets';
import { getDeviceDimensions, estimateTextWidth } from '../../../utils/deviceDimensions';

interface TextPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  elements?: any[];
}

// Polices organisées par catégories - Enrichies avec de nouvelles Google Fonts
const fontCategories = [{
  name: "Business",
  fonts: [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito Sans', 'Inter', 'Poppins', 'Work Sans', 'IBM Plex Sans',
    // Nouvelles polices business modernes
    'DM Sans', 'Plus Jakarta Sans', 'Manrope', 'Space Grotesk', 'Outfit', 'Lexend', 'Sora', 'Red Hat Display', 'Figtree', 'Onest',
    'Geist Sans', 'Albert Sans', 'Be Vietnam Pro', 'Epilogue', 'Satoshi', 'Urbanist', 'Cabinet Grotesk', 'General Sans'
  ]
}, {
  name: "Calm",
  fonts: [
    'Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Lora', 'Merriweather', 'Playfair Display', 'Cormorant Garamond', 'Spectral', 'Source Serif Pro', 'Vollkorn',
    // Nouvelles polices calmes et sereines
    'Fraunces', 'Newsreader', 'Literata', 'Crimson Pro', 'Libre Caslon Text', 'Zilla Slab', 'Bitter', 'Alegreya', 'Neuton', 'Gentium Plus',
    'Cardo', 'Domine', 'Arvo', 'Rokkitt', 'Slabo 27px', 'PT Serif', 'Droid Serif', 'Noto Serif'
  ]
}, {
  name: "Cute",
  fonts: [
    'Caveat', 'Indie Flower', 'Architects Daughter', 'Shadows Into Light', 'Covered By Your Grace', 'Handlee', 'Kalam', 'Coming Soon', 'Sue Ellen Francisco', 'Schoolbell',
    // Nouvelles polices mignonnes et amicales
    'Quicksand', 'Comfortaa', 'Nunito', 'Rubik', 'Varela Round', 'Fredoka', 'Baloo 2', 'Dosis', 'Livvic', 'Hind',
    'Karla', 'Assistant', 'Mukti', 'Catamaran', 'Muli', 'Oxygen', 'Ubuntu', 'Cabin', 'Lato', 'Raleway'
  ]
}, {
  name: "Fancy",
  fonts: [
    'Cinzel', 'Cormorant', 'Abril Fatface', 'Yeseva One', 'Fredericka the Great', 'Almendra', 'UnifrakturMaguntia', 'Cardo', 'Old Standard TT', 'Libre Caslon Text',
    // Nouvelles polices élégantes et sophistiquées
    'Bodoni Moda', 'Italiana', 'Tenor Sans', 'Marcellus', 'Forum', 'Philosopher', 'Sorts Mill Goudy', 'Bentham', 'Caudex', 'Fanwood Text',
    'Gilda Display', 'Judson', 'Linden Hill', 'Radley', 'Rufina', 'Vidaloka', 'Amiri', 'Cormorant Upright', 'Enriqueta', 'Trajan Pro'
  ]
}, {
  name: "Playful",
  fonts: [
    'Lobster', 'Pacifico', 'Fredoka One', 'Righteous', 'Bungee', 'Chewy', 'Leckerli One', 'Creepster', 'Sigmar One', 'Shrikhand',
    // Nouvelles polices ludiques et amusantes
    'Bowlby One', 'Titan One', 'Bungee Shade', 'Modak', 'Orbitron', 'Press Start 2P', 'Bangers', 'Kalam', 'Griffy', 'Luckiest Guy',
    'Lilita One', 'Bree Serif', 'Bungee Inline', 'Faster One', 'Fascinate', 'Fontdiner Swanky', 'Jolly Lodger', 'Nosifer', 'Rye', 'Special Elite'
  ]
}, {
  name: "Artistic",
  fonts: [
    'Dancing Script', 'Great Vibes', 'Allura', 'Satisfy', 'Kaushan Script', 'Tangerine', 'Sacramento', 'Yellowtail', 'Pinyon Script', 'Marck Script', 'Amatic SC', 'Permanent Marker', 'Homemade Apple', 'Rock Salt',
    // Nouvelles polices artistiques et créatives
    'Parisienne', 'Alex Brush', 'Courgette', 'Grand Hotel', 'Kalam', 'Lobster Two', 'Marmelad', 'Neucha', 'Pangolin', 'Patrick Hand',
    'Reenie Beanie', 'Shadows Into Light Two', 'Short Stack', 'Walter Turncoat', 'Zeyada', 'Bad Script', 'Caveat Brush', 'Dawning of a New Day', 'Delius', 'Gloria Hallelujah'
  ]
}];
// Fusionne deux objets de styles CSS en gérant les propriétés cumulables
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

const TextPanel: React.FC<TextPanelProps> = ({
  onAddElement,
  selectedElement,
  onElementUpdate,
  selectedDevice = 'desktop',
  elements = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState(fontCategories[0]);
  const [showEffects, setShowEffects] = useState(false);
  const [activeTab, setActiveTab] = useState<'combinaisons' | 'polices'>('combinaisons');
  const [stackEffects, setStackEffects] = useState(false);

  // Les presets sont désormais importés depuis src/config/titlePresets.ts

  // Ajouter un texte avec préréglages optionnels ou modifier le texte sélectionné
  const addText = (preset?: any, stylePreset?: any) => {
    // Si un texte est sélectionné, modifier ses propriétés au lieu de créer un nouveau texte
    if (selectedElement && selectedElement.type === 'text' && onElementUpdate) {
      const updates: any = {};
      
      // Appliquer la police si spécifiée
      if (preset?.fontFamily) {
        updates.fontFamily = preset.fontFamily;
      }
      
      // Appliquer d'autres propriétés du preset (mais PAS la taille pour préserver celle existante)
      // if (preset?.fontSize) updates.fontSize = preset.fontSize; // Commenté pour garder la taille existante
      if (preset?.color) updates.color = preset.color;
      if (preset?.fontWeight) updates.fontWeight = preset.fontWeight;
      if (preset?.textAlign) updates.textAlign = preset.textAlign;
      if (typeof preset?.letterSpacing !== 'undefined') updates.letterSpacing = preset.letterSpacing;
      if (typeof preset?.lineHeight !== 'undefined') updates.lineHeight = preset.lineHeight;
      
      // Appliquer les styles avancés si présents
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
    
    // Sinon, créer un nouveau texte comme avant
    const currentCanvas = getDeviceDimensions(selectedDevice);
    
    // Vérifier si c'est le premier texte ajouté
    const existingTextElements = elements
      .filter(el => el.type === 'text')
      .sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
    const textIndex = existingTextElements.length;
    const isFirstText = textIndex === 0;
    const baseFontSize = preset?.fontSize || 24;
    const desktopFontSize = isFirstText ? Math.round(baseFontSize * 2) : baseFontSize;
    const mobileFontSize = Math.max(Math.round(desktopFontSize * 4), 96);
    const fontSize = selectedDevice === 'mobile' ? mobileFontSize : desktopFontSize;
    const fontWeight = preset?.fontWeight || (isFirstText ? 'bold' : 'normal');
    const fontFamily = preset?.fontFamily || 'Open Sans';
    const textContent = preset?.text || stylePreset?.text || 'Nouveau texte';
    
    // Calculer la largeur estimée du texte pour un meilleur centrage
    const estimatedTextWidth = estimateTextWidth(textContent, fontSize, fontWeight, fontFamily);
    const textHeight = fontSize * 1.2;
    const horizontalCenter = Math.max(0, (currentCanvas.width - estimatedTextWidth) / 2);
    const topOffset = 50;
    const autoCenterMode: 'horizontal' = 'horizontal';

    const stackedOffset = existingTextElements.reduce((offset, el) => {
      const existingHeight = typeof el.fontSize === 'number' ? el.fontSize * 1.2 : textHeight;
      return Math.max(offset, (el.y ?? topOffset) + existingHeight + 32);
    }, topOffset);
    
    const newElement: any = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: textContent,
      x: horizontalCenter,
      y: stackedOffset,
      fontSize: fontSize,
      color: preset?.color || '#000000',
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      textAlign: preset?.textAlign || (isFirstText ? 'center' : 'left'),
      autoCenter: autoCenterMode,
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
    // Pre-set coordinates for all devices to ensure proper centering
    const allDevices = ['desktop', 'tablet', 'mobile'] as const;
    allDevices.forEach(device => {
      const deviceCanvas = getDeviceDimensions(device);
      const deviceFontSize = device === 'mobile' ? mobileFontSize : desktopFontSize;
      const deviceEstimatedWidth = estimateTextWidth(textContent, deviceFontSize, fontWeight, fontFamily);
      const deviceTextSize = { width: deviceEstimatedWidth, height: deviceFontSize * 1.2 };
      const deviceCenterX = Math.max(0, (deviceCanvas.width - deviceTextSize.width) / 2);
      const deviceStackedOffset = existingTextElements.reduce((offset, el) => {
        const perDevice = (el as any)[device];
        const baseY = perDevice?.y ?? el.y ?? topOffset;
        const baseFont = perDevice?.fontSize ?? el.fontSize ?? fontSize;
        const elementHeight = (typeof baseFont === 'number' ? baseFont : fontSize) * 1.2;
        return Math.max(offset, baseY + elementHeight + 32);
      }, topOffset);
      const deviceTop = Math.max(deviceStackedOffset, topOffset);
      newElement[device] = {
        ...(newElement[device] || {}),
        x: deviceCenterX,
        y: deviceTop,
        fontSize: deviceFontSize
      };
    });
    onAddElement(newElement);
  };

  // Insérer un template composite (plusieurs calques de texte)
  const addComposite = (composite: any) => {
    const currentCanvas = getDeviceDimensions(selectedDevice);
    const topOffset = 50;
    const existingTextElements = elements.filter(el => el.type === 'text');
    const layers = [...(composite?.layers || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    layers.forEach((layer: any, idx: number) => {
      const layerBaseFontSize = layer?.preset?.fontSize || 24;
      const layerDesktopFontSize = layerBaseFontSize;
      const layerMobileFontSize = Math.max(
        Math.round(layerDesktopFontSize * 4),
        Math.round((layer?.preset?.fontSize || 24) * 4),
        96
      );
      const layerFontSize = selectedDevice === 'mobile' ? layerMobileFontSize : layerDesktopFontSize;
      const layerText = layer.text || composite.sample || 'Texte';
      const estimatedLayerWidth = estimateTextWidth(layerText, layerFontSize, layer?.preset?.fontWeight || 'normal', layer?.preset?.fontFamily || 'Open Sans');
    const baseHorizontalCenter = Math.max(0, (currentCanvas.width - estimatedLayerWidth) / 2);
    const currentStackedOffset = existingTextElements.reduce((offset, el) => {
      const baseFont = el.fontSize ?? layerDesktopFontSize;
      const perDevice = (el as any)[selectedDevice];
      const y = perDevice?.y ?? el.y ?? topOffset;
      const height = (typeof baseFont === 'number' ? baseFont : layerDesktopFontSize) * 1.2;
      return Math.max(offset, y + height + 32);
    }, topOffset);
    const baseVertical = currentStackedOffset + Math.round(idx * (layerFontSize * 1.2));
      const el: any = {
        id: `text-${Date.now()}-${idx}`,
        type: 'text',
        content: layerText,
        x: baseHorizontalCenter + (layer.offsetX || 0),
        y: baseVertical + (layer.offsetY || 0),
        fontSize: layerFontSize,
        color: layer?.preset?.color || '#000000',
        fontFamily: layer?.preset?.fontFamily || 'Open Sans',
        fontWeight: layer?.preset?.fontWeight || 'normal',
        textAlign: layer?.preset?.textAlign || 'left',
        autoCenter: 'horizontal',
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
      const devices = ['desktop', 'tablet', 'mobile'] as const;
      devices.forEach(device => {
        const deviceCanvas = getDeviceDimensions(device);
        const deviceFontSize = device === 'mobile' ? layerMobileFontSize : layerDesktopFontSize;
        const deviceEstimatedWidth = estimateTextWidth(layerText, deviceFontSize, layer?.preset?.fontWeight || 'normal', layer?.preset?.fontFamily || 'Open Sans');
        const deviceCenterX = Math.max(0, (deviceCanvas.width - deviceEstimatedWidth) / 2);
        const deviceStackedOffset = existingTextElements.reduce((offset, el) => {
          const perDevice = (el as any)[device];
          const y = perDevice?.y ?? el.y ?? topOffset;
          const baseFont = perDevice?.fontSize ?? el.fontSize ?? deviceFontSize;
          const height = (typeof baseFont === 'number' ? baseFont : deviceFontSize) * 1.2;
          return Math.max(offset, y + height + 32);
        }, topOffset);
        const deviceBaseY = deviceStackedOffset + Math.round(idx * (deviceFontSize * 1.2));
        el[device] = {
          ...(el[device] || {}),
          x: deviceCenterX + (layer.offsetX || 0),
          y: deviceBaseY + (layer.offsetY || 0),
          fontSize: deviceFontSize
        };
      });
      onAddElement(el);
    });
  };

  if (showEffects) {
    return (
      <TextEffectsPanel 
        onBack={() => setShowEffects(false)}
        selectedElement={selectedElement}
        onElementUpdate={onElementUpdate}
      />
    );
  }

  return <div className="p-4 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Texte</h3>
        <p className="text-sm text-muted-foreground">Ajoutez et personnalisez du texte</p>
      </div>

      {/* Onglets: Combinaisons (templates) vs Polices (catégories) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`p-2 text-sm rounded transition-all ${activeTab === 'combinaisons' ? 'bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('combinaisons')}
        >
          Combinaisons
        </button>
        <button
          className={`p-2 text-sm rounded transition-all ${activeTab === 'polices' ? 'bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('polices')}
        >
          Polices
        </button>
      </div>
      <p className="text-xs text-gray-500">
        {activeTab === 'combinaisons' ? 'Templates de combinaisons (police + effets) prêts à insérer.' : 'Parcourez les catégories et insérez un texte avec une police.'}
      </p>

      <div className="space-y-6">
          {/* Bouton d'ajout simple */}
          <div>
            <button onClick={() => addText()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] hover:text-white transition-colors flex items-center justify-center group">
              <Type className="w-5 h-5 mr-2 text-gray-600 group-hover:text-white" />
              <span className="text-sm text-gray-600 group-hover:text-white">Ajouter du texte</span>
            </button>
          </div>

          {activeTab === 'combinaisons' ? (
            // Galerie inline de combinaisons
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Combinaisons</h4>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={stackEffects}
                    onChange={(e) => setStackEffects(e.target.checked)}
                  />
                  Empiler les effets
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto">
                {titlePresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addText({ ...p.preset, text: p.sample }, p.stylePreset)}
                    className="p-3 border border-gray-200 rounded hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] hover:text-white transition-colors text-left group"
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

              {/* Composites multi-couches */}
              <h4 className="text-sm font-semibold text-gray-700 mt-4">Composites</h4>
              <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto">
                {compositeTitlePresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addComposite(p)}
                    className="p-3 border border-gray-200 rounded hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] hover:text-white transition-colors text-left group"
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
          ) : (
            <>
              {/* Sélecteur de catégories */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Catégories de polices</h4>
                <div className="grid grid-cols-3 gap-2">
                  {fontCategories.map((category, index) => (
                    <button
                      key={index}
                      className={`p-2 text-xs rounded cursor-pointer transition-all duration-200 ${selectedCategory.name === category.name ? 'bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Polices de la catégorie sélectionnée */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">{selectedCategory.name}</h4>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {selectedCategory.fonts.map(font => (
                    <button
                      key={font}
                      onClick={() => addText({ text: 'Texte stylé', fontFamily: font, fontSize: 24 })}
                      className="p-2 border border-gray-200 rounded hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#E0004D,_#6B2AA0)] hover:text-white transition-colors text-left group"
                    >
                      <span style={{ fontFamily: font }} className="text-xl group-hover:text-white">{font}</span>
                      <p className="text-xs text-gray-500 mt-1 group-hover:text-white">{selectedCategory.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}


        </div>
      </div>;
};
export default TextPanel;

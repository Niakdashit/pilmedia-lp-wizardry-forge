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
export const fontCategories = [{
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
    const existingTextElements = elements.filter(el => el.type === 'text');
    const isFirstText = existingTextElements.length === 0;
    const baseFontSize = preset?.fontSize || 24;
    const fontSize = isFirstText ? Math.round(baseFontSize * 2) : baseFontSize;
    const fontWeight = preset?.fontWeight || (isFirstText ? 'bold' : 'normal');
    const fontFamily = preset?.fontFamily || 'Open Sans';
    const textContent = preset?.text || stylePreset?.text || 'Nouveau texte';
    
    // Calculer la largeur estimée du texte pour un meilleur centrage
    const estimatedTextWidth = estimateTextWidth(textContent, fontSize, fontWeight, fontFamily);
    const textSize = { width: estimatedTextWidth, height: fontSize * 1.2 };
    const horizontalCenter = Math.max(0, (currentCanvas.width - textSize.width) / 2);
    const topOffset = 50;
    
    const newElement: any = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: textContent,
      x: horizontalCenter,
      y: topOffset,
      fontSize: fontSize,
      color: preset?.color || '#000000',
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      textAlign: preset?.textAlign || (isFirstText ? 'center' : 'left'),
      autoCenter: 'horizontal',
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
      if (device !== selectedDevice) {
        const deviceCanvas = getDeviceDimensions(device);
        const deviceEstimatedWidth = estimateTextWidth(textContent, fontSize, fontWeight, fontFamily);
        const deviceTextSize = { width: deviceEstimatedWidth, height: fontSize * 1.2 };
        const deviceCenterX = Math.max(0, (deviceCanvas.width - deviceTextSize.width) / 2);
        const deviceTop = topOffset;
        newElement[device] = {
          ...(newElement[device] || {}),
          x: deviceCenterX,
          y: deviceTop
        };
      }
    });
    onAddElement(newElement);
  };

  // Insérer un template composite (plusieurs calques de texte)
  const addComposite = (composite: any) => {
    const currentCanvas = getDeviceDimensions(selectedDevice);
    const defaultTextSize = { width: 200, height: 40 };
    const horizontalCenter = Math.max(0, (currentCanvas.width - defaultTextSize.width) / 2);
    const topOffset = 50;
    const baseX = horizontalCenter;
    const baseY = topOffset;
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
        fontFamily: layer?.preset?.fontFamily || 'Open Sans',
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
        const mobileCenterX = Math.max(0, (mobileCanvas.width - defaultTextSize.width) / 2);
        const mobileTop = topOffset;
        el.mobile = {
          ...(el.mobile || {}),
          x: mobileCenterX,
          y: mobileTop
        };
      }
      onAddElement(el);
    });
  };

  // Per request, hide the entire TextPanel content (intro and everything after)
  return null;
};
export default TextPanel;

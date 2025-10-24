import React, { useMemo, useRef, useState } from 'react';
import { Upload, Pipette, RotateCw } from 'lucide-react';
import ColorThief from 'colorthief';
import { fontCategories } from './TextPanel';
import { supabase } from '@/integrations/supabase/client';
import { useEditorStore } from '@/stores/editorStore';

type QuickFx = { id: string; name: string; style: React.CSSProperties; category?: 'style' | 'shape' };
const QUICK_TEXT_EFFECTS: QuickFx[] = [
  // Style
  { id: 'none', name: 'Aucun', category: 'style', style: {} },
  { id: 'shadow', name: 'Ombres', category: 'style', style: { textShadow: '0 2px 4px rgba(0,0,0,0.35)' } },
  { id: 'elevation', name: 'Élévation', category: 'style', style: { textShadow: '0 8px 24px rgba(0,0,0,0.35)' } },
  { id: 'outline', name: 'Contour', category: 'style', style: { WebkitTextStroke: '1.5px #111', color: '#fff' } as React.CSSProperties },
  { id: 'bevel', name: 'Biseautage', category: 'style', style: { textShadow: '1px 1px 0 #cfcfcf, -1px -1px 0 #ffffff, 1px -1px 0 #e5e5e5, -1px 1px 0 #e5e5e5' } },
  { id: 'border', name: 'Bordure', category: 'style', style: { border: '2px solid currentColor', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' } },
  { id: 'echo', name: 'Écho', category: 'style', style: { textShadow: '2px 2px 0 rgba(0,0,0,0.25), 4px 4px 0 rgba(0,0,0,0.15)' } },
  { id: 'glitch', name: 'Glitch', category: 'style', style: { textShadow: '2px 0 #00e5ff, -2px 0 #ff00aa' } },
  { id: 'neon', name: 'Néon', category: 'style', style: { color: '#fff', textShadow: '0 0 6px #ff00e6, 0 0 14px #ff00e6, 0 0 24px #ff00e6' } },
  { id: 'background', name: 'Arrière-plan', category: 'style', style: { backgroundColor: 'rgba(0,0,0,0.08)', color: '#111', padding: '8px 12px', borderRadius: '6px', display: 'inline-block' } },
  
];

interface BackgroundPanelProps {
  onBackgroundChange: (background: { type: 'color' | 'image'; value: string }, options?: { screenId?: 'screen1' | 'screen2' | 'screen3'; applyToAllScreens?: boolean; device?: 'desktop' | 'tablet' | 'mobile' }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[];
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  onModuleUpdate?: (id: string, patch: any) => void;
  // 'fill' applies text color or shape background; 'border' applies shape borderColor
  colorEditingContext?: 'fill' | 'border' | 'text';
  // Current modular screen to target per-screen background application
  currentScreen?: 'screen1' | 'screen2' | 'screen3';
  // Current editor device to scope backgrounds per device (desktop/tablet/mobile)
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}

// Updated with debug logs - v2
const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ 
  onBackgroundChange, 
  onExtractedColorsChange,
  currentBackground,
  extractedColors = [],
  selectedElement,
  onElementUpdate,
  onModuleUpdate,
  colorEditingContext = 'fill',
  currentScreen,
  selectedDevice
}) => {
  console.log('🎨🎨🎨 BackgroundPanel MOUNTED with props:', {
    selectedElementId: selectedElement?.id,
    selectedElementType: selectedElement?.type,
    hasOnElementUpdate: !!onElementUpdate,
    colorEditingContext,
    currentScreen,
    selectedDevice,
    timestamp: new Date().toISOString()
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [customColor, setCustomColor] = useState('#FF0000');
  const campaignId = useEditorStore((s) => (s.campaign as any)?.id as string | undefined);
  const availableFontCategories = useMemo(() => fontCategories, []);
  const [selectedFontCategory, setSelectedFontCategory] = useState(() => availableFontCategories[0]);
  // Sous-onglets: Style (par défaut) et Effets
  const [activeSubTab, setActiveSubTab] = useState<'style' | 'effects'>('style');
  // Option: appliquer l'image de fond à tous les écrans (desktop/tablette/mobile)
  const [applyToAllScreens, setApplyToAllScreens] = useState<boolean>(false);
  
  // Gérer le changement de la checkbox
  const handleApplyToAllScreensChange = (checked: boolean) => {
    setApplyToAllScreens(checked);
    
    // Si on décoche, supprimer les images des autres écrans pour le device courant
    if (!checked && typeof window !== 'undefined' && selectedDevice) {
      console.log('🗑️ [BackgroundPanel] Clearing backgrounds from other screens for device:', selectedDevice);
      const evt = new CustomEvent('clearBackgroundOtherScreens', { 
        detail: { 
          device: selectedDevice, 
          keepScreenId: currentScreen 
        } 
      });
      window.dispatchEvent(evt);
    }
  };
  
  // États pour personnaliser les couleurs des effets rapides
  // const [effectBackgroundColor, setEffectBackgroundColor] = useState<string>('#FFD700');
  // const [effectTextColor, setEffectTextColor] = useState<string>('#000000');
  const [currentEffectId, setCurrentEffectId] = useState<string | null>(null);
  // Réglages Ombres
  const [shadowDistance, setShadowDistance] = useState<number>(50);
  const [shadowAngle, setShadowAngle] = useState<number>(-45);
  const [shadowBlur, setShadowBlur] = useState<number>(0);
  const [shadowOpacity, setShadowOpacity] = useState<number>(40);
  const [shadowColor, setShadowColor] = useState<string>('#000000');
  // Réglages Écho
  const [echoDistance, setEchoDistance] = useState<number>(50);
  const [echoAngle, setEchoAngle] = useState<number>(-45);
  const [echoColor, setEchoColor] = useState<string>('#000000');
  // Réglages Néon
  const [neonIntensity, setNeonIntensity] = useState<number>(50);
  const [neonColor, setNeonColor] = useState<string>('#ff00e6');
  const [neonTextColor, setNeonTextColor] = useState<string>('#ffffff');
  // Réglage Élévation
  const [elevationIntensity, setElevationIntensity] = useState<number>(50);
  // Réglage Contour
  const [outlineThickness, setOutlineThickness] = useState<number>(50);
  const [outlineColor, setOutlineColor] = useState<string>('#111111');
  // Réglages Biseautage
  const [bevelThickness, setBevelThickness] = useState<number>(50);
  const [bevelDistance, setBevelDistance] = useState<number>(50);
  const [bevelAngle, setBevelAngle] = useState<number>(-45);
  const [bevelColor, setBevelColor] = useState<string>('#808080');
  // Réglages Bordure (cadre autour du texte)
  const [boxBorderThickness, setBoxBorderThickness] = useState<number>(2 * 10); // map 0..100 -> 0..10px; default ~20 => 2px
  const [boxBorderColor, setBoxBorderColor] = useState<string>('#111111');
  const [boxBorderRadius, setBoxBorderRadius] = useState<number>(8 * (100/24)); // valeur par défaut ~8px sur échelle 0..24
  // Réglages Arrière-plan
  const [bgRadius, setBgRadius] = useState<number>(50); // 0..100 -> 0..24px
  const [bgGap, setBgGap] = useState<number>(50); // 0..100 -> 0..24px padding Y, + proportionnel X
  const [bgAlpha, setBgAlpha] = useState<number>(100); // 0..100 -> 0..1
  const [bgColor, setBgColor] = useState<string>('#FFD700');
  const [bgTextColor, setBgTextColor] = useState<string>('#111111');

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const h = hex.replace('#', '');
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return { r, g, b };
    }
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return { r, g, b };
    }
    return null;
  };

  // Rotation logique en degrés (affichée et appliquée)
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  // Valeur du slider avec sensibilité réduite (facteur 2)
  const SENSITIVITY = 2; // 2x plus lent sans perdre la précision au degré
  const [uiRotation, setUiRotation] = useState<number>(0);
  React.useEffect(() => {
    const cur = typeof (selectedElement as any)?.rotation === 'number' ? (selectedElement as any).rotation : 0;
    setRotationDeg(cur);
    setUiRotation(cur * SENSITIVITY);
  }, [selectedElement?.id, (selectedElement as any)?.rotation]);

  // Vérifier si un élément est sélectionné
  const isTextSelected = selectedElement && (
    selectedElement.type === 'text' ||
    selectedElement.type === 'BlocTexte' ||
    selectedElement.elementType === 'text'
  );
  const isShapeSelected = selectedElement && selectedElement.type === 'shape';
  
  // Déterminer la couleur actuelle en fonction de la sélection et du contexte
  const getCurrentColor = () => {
    if (isTextSelected) {
      if (colorEditingContext === 'border') {
        // Texte peut ne pas avoir de bordure; fallback à la couleur du texte si absent
        return selectedElement.borderColor || selectedElement.color || selectedElement.bodyColor || '#000000';
      }
      // Pour BlocTexte, utiliser bodyColor, sinon color
      return selectedElement.bodyColor || selectedElement.color || '#000000';
    }
    if (isShapeSelected) {
      if (colorEditingContext === 'border') {
        return selectedElement.borderColor || '#000000';
      }
      if (colorEditingContext === 'text') {
        return selectedElement.textColor || '#000000';
      }
      // Replace old blue fallback by a neutral border token to keep brand consistency
      return selectedElement.backgroundColor || 'hsl(var(--border))';
    }
    return currentBackground?.type === 'color' ? currentBackground.value : undefined;
  };
  
  console.log('🎨 BackgroundPanel render:', {
    selectedElement: selectedElement?.id || selectedElement?.type,
    selectedElementType: selectedElement?.type,
    isTextSelected,
    isShapeSelected,
    colorEditingContext,
    currentColor: getCurrentColor(),
    hasOnElementUpdate: !!onElementUpdate,
    timestamp: new Date().toISOString()
  });

  // Fonction pour appliquer une couleur
  const applyColor = (color: string) => {
    console.log('🎨 applyColor called:', {
      color,
      isTextSelected,
      isShapeSelected,
      colorEditingContext,
      hasOnElementUpdate: !!onElementUpdate,
      selectedElement: selectedElement?.id || selectedElement?.type
    });
    
    if (isTextSelected && onElementUpdate) {
      // Texte: bordure optionnelle, sinon couleur du texte
      if (colorEditingContext === 'border') {
        console.log('🎨 Updating text border color:', color);
        onElementUpdate({ borderColor: color });
      } else {
        console.log('🎨 Updating text color:', color);
        // Pour BlocTexte, utiliser bodyColor, sinon color
        const colorProp = selectedElement.type === 'BlocTexte' ? 'bodyColor' : 'color';
        onElementUpdate({ [colorProp]: color });
      }
    } else if (isShapeSelected && onElementUpdate) {
      // Forme: selon le contexte
      if (colorEditingContext === 'border') {
        console.log('🎨 Updating shape border color:', color);
        onElementUpdate({ borderColor: color });
      } else if (colorEditingContext === 'text') {
        console.log('🎨 Updating shape text color:', color);
        onElementUpdate({ textColor: color });
      } else {
        console.log('🎨 Updating shape background color:', color);
        onElementUpdate({ backgroundColor: color });
      }
    } else {
      // Appliquer à l'arrière-plan (toujours fill)
      console.log('🎨 Updating background color:', color);
      onBackgroundChange(
        { type: 'color', value: color },
        {
          screenId: currentScreen,
          applyToAllScreens: applyToAllScreens,
          device: selectedDevice
        }
      );
      
      // Émettre un événement pour synchroniser avec TemplatedQuiz et FunnelQuizParticipate
      const event = new CustomEvent('quizStyleUpdate', {
        detail: { backgroundColor: color }
      });
      window.dispatchEvent(event);
    }
  };

  // La fonction getCurrentColor() est utilisée directement dans le rendu

  const backgroundColors = [
    '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA',
    '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C69', '#87CEEB', '#98FB98'
  ];

  const currentQuickEffectId = selectedElement?.advancedStyle?.id || 'none';
  // Utiliser l'état local si présent pour un feedback immédiat dans l'UI
  const effectiveEffectId = currentEffectId ?? currentQuickEffectId;
  React.useEffect(() => {
    if (!currentEffectId) {
      setCurrentEffectId(currentQuickEffectId);
    }
  }, [currentQuickEffectId, currentEffectId]);

  const applyQuickEffect = (effectId: string, customBgColor?: string, customTextColor?: string) => {
    const effect = QUICK_TEXT_EFFECTS.find((fx) => fx.id === effectId);
    if (!effect) return;

    // Mémoriser l'effet actuel
    setCurrentEffectId(effectId);
    
    // Si on a des couleurs personnalisées, les utiliser
    let effectCss = { ...effect.style } as React.CSSProperties;
    if (effectId === 'shadow') {
      // Calculer l'ombre depuis les paramètres
      const rad = (shadowAngle * Math.PI) / 180;
      const dx = Math.round(Math.cos(rad) * shadowDistance * 0.4); // facteur d'échelle doux
      const dy = Math.round(Math.sin(rad) * shadowDistance * 0.4);
      const rgb = hexToRgb(shadowColor) || { r: 0, g: 0, b: 0 };
      const a = Math.max(0, Math.min(1, shadowOpacity / 100));
      effectCss.textShadow = `${dx}px ${dy}px ${shadowBlur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
    }
    if (effectId === 'echo') {
      // Écho: plusieurs couches nettes (sans flou) le long d'un angle
      const rad = (echoAngle * Math.PI) / 180;
      const rgb = hexToRgb(echoColor) || { r: 0, g: 0, b: 0 };
      const max = Math.max(0, Math.min(100, echoDistance));
      const totalOffset = Math.round(4 + (max / 100) * 24); // 4..28 px
      const steps = 4; // nombre de couches
      const parts: string[] = [];
      for (let i = 1; i <= steps; i++) {
        const f = i / steps; // 0.25, 0.5, 0.75, 1
        const dx = Math.round(Math.cos(rad) * totalOffset * f);
        const dy = Math.round(Math.sin(rad) * totalOffset * f);
        // Opacité décroissante
        const a = [0.35, 0.27, 0.20, 0.14][i - 1] ?? 0.12;
        parts.push(`${dx}px ${dy}px 0 rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`);
      }
      effectCss.textShadow = parts.join(', ');
    }
    if (effectId === 'neon') {
      // Néon: plusieurs halos concentriques autour de la couleur choisie
      const level = Math.max(0, Math.min(100, neonIntensity));
      const t = level / 100; // 0..1
      const base = hexToRgb(neonColor) || { r: 255, g: 0, b: 230 };
      // Trois à cinq couches en fonction de l'intensité
      const layers = [
        { blur: Math.round(4 + 8 * t), a: 0.65 },
        { blur: Math.round(10 + 18 * t), a: 0.45 },
        { blur: Math.round(20 + 34 * t), a: 0.30 },
        { blur: Math.round(34 + 46 * t), a: 0.20 },
        { blur: Math.round(48 + 64 * t), a: 0.12 },
      ];
      const parts = layers.map(l => `0 0 ${l.blur}px rgba(${base.r}, ${base.g}, ${base.b}, ${l.a})`);
      effectCss.textShadow = parts.join(', ');
      // Couleur du texte (coeur du néon)
      effectCss.color = neonTextColor || '#ffffff';
    }
    if (effectId === 'elevation') {
      // Élévation: halo doux autour du texte, basé sur l'intensité
      // On génère plusieurs couches concentriques
      const base = Math.max(0, Math.min(100, elevationIntensity));
      const blur1 = Math.round(6 + base * 0.12);   // 6..18
      const blur2 = Math.round(14 + base * 0.24);  // 14..38
      const blur3 = Math.round(24 + base * 0.36);  // 24..60
      const a1 = 0.25;
      const a2 = 0.18;
      const a3 = 0.12;
      effectCss.textShadow = `0 2px ${blur1}px rgba(0,0,0,${a1}), 0 4px ${blur2}px rgba(0,0,0,${a2}), 0 8px ${blur3}px rgba(0,0,0,${a3})`;
    }
    if (effectId === 'outline') {
      // Contour progressif: mapping linéaire 0..100 -> 0.5..8px (continu)
      const clamped = Math.max(0, Math.min(100, outlineThickness));
      const minPx = 0.5;
      const maxPx = 8;
      const px = minPx + (clamped / 100) * (maxPx - minPx);
      (effectCss as any).WebkitTextStroke = `${px.toFixed(2)}px ${outlineColor}`;
      effectCss.color = '#ffffff';
      // Fallback pour navigateurs sans -webkit-text-stroke: 4 ombres fines
      if (!("WebkitTextStroke" in document.documentElement.style)) {
        const c = outlineColor;
        const p = px.toFixed(2);
        effectCss.textShadow = `-${p}px 0 ${c}, ${p}px 0 ${c}, 0 -${p}px ${c}, 0 ${p}px ${c}`;
      }
    }
    if (effectId === 'bevel') {
      // Biseautage: superposition de couches claires/sombres selon un angle
      const t = Math.max(0, Math.min(100, bevelThickness));
      const d = Math.max(0, Math.min(100, bevelDistance));
      const steps = Math.max(3, Math.round(3 + (t / 100) * 7)); // 3..10 couches
      const distPx = (d / 100) * 6; // 0..6px
      const rad = (bevelAngle * Math.PI) / 180;
      const base = hexToRgb(bevelColor) || { r: 128, g: 128, b: 128 };
      const blend = (a: number, b: number, p: number) => Math.round(a * (1 - p) + b * p);
      const light = { r: blend(base.r, 255, 0.6), g: blend(base.g, 255, 0.6), b: blend(base.b, 255, 0.6) };
      const dark = { r: blend(base.r, 0, 0.6), g: blend(base.g, 0, 0.6), b: blend(base.b, 0, 0.6) };
      const parts: string[] = [];
      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        const dx = Math.cos(rad) * distPx * f;
        const dy = Math.sin(rad) * distPx * f;
        parts.push(`${dx.toFixed(2)}px ${dy.toFixed(2)}px 0 rgba(${dark.r}, ${dark.g}, ${dark.b}, ${Math.max(0, 0.45 - f * 0.25)})`);
        parts.push(`${(-dx).toFixed(2)}px ${(-dy).toFixed(2)}px 0 rgba(${light.r}, ${light.g}, ${light.b}, ${Math.max(0, 0.55 - f * 0.25)})`);
      }
      effectCss.textShadow = parts.join(', ');
      (effectCss as any).WebkitTextStroke = `${(0.5 + (t / 100) * 0.5).toFixed(2)}px rgba(0,0,0,0.6)`; // léger trait
    }
    if (effectId === 'background') {
      // Arrière-plan: pastille derrière le texte, arrondi stable quel que soit la taille de police
      const rPx = Math.round((Math.max(0, Math.min(100, bgRadius)) / 100) * 24); // 0..24px
      const gap = Math.round((Math.max(0, Math.min(100, bgGap)) / 100) * 24); // 0..24px
      const alpha = Math.max(0, Math.min(1, bgAlpha / 100));
      const rgb = hexToRgb(bgColor) || { r: 255, g: 215, b: 0 };
      // Hauteur minimale pour que le rayon ne soit pas visuellement réduit quand le texte est petit
      const minH = Math.max(28, 2 * rPx + 2 * gap); // au moins 28px, sinon 2*rayon + padding vertical
      effectCss.display = 'inline-flex';
      (effectCss as any).alignItems = 'center';
      (effectCss as any).justifyContent = 'center';
      (effectCss as any).minHeight = `${minH}px`;
      effectCss.borderRadius = `${rPx}px`;
      effectCss.padding = `${gap}px ${Math.round(gap * 1.5)}px`;
      effectCss.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      effectCss.color = bgTextColor || '#111111';
    }
    if (customBgColor) {
      effectCss.backgroundColor = customBgColor;
    } else if (effect.style.backgroundColor) {
      // Use effect backgroundColor
    }
    if (customTextColor) {
      effectCss.color = customTextColor;
    } else if (effect.style.color) {
      // Use effect color
    }

    const baseUpdates = effectId === 'none'
      ? {
          customCSS: undefined,
          advancedStyle: undefined,
          advancedStyleParams: undefined,
          textEffect: undefined,
          content: selectedElement?.content ?? ''
        }
      : {
          customCSS: effectCss,
          advancedStyle: {
            id: effectId,
            name: effect.name,
            category: 'effect',
            css: effectCss
          },
          advancedStyleParams: undefined,
          textEffect: effectId,
          content: selectedElement?.content ?? ''
        };

    // Centralize routing through DesignCanvas listener so modules/elements are handled correctly
    console.log('🎨 Dispatching applyTextEffect from BackgroundPanel', {
      effectId,
      selectedElementSummary: {
        id: (selectedElement as any)?.id || selectedElement,
        type: (selectedElement as any)?.type,
      }
    });
    const updateEvent = new CustomEvent('applyTextEffect', { detail: baseUpdates });
    window.dispatchEvent(updateEvent);
  };

  const extractColorsFromImage = async (imageUrl: string) => {
    return new Promise<string[]>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          // Extraire une palette de 8 couleurs pour avoir un bon choix
          const palette = colorThief.getPalette(img, 8);
          const extractedColors = palette.map(color => 
            `rgb(${color[0]}, ${color[1]}, ${color[2]})`
          );
          resolve(extractedColors);
        } catch (error) {
          console.error('Error extracting colors:', error);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imageUrl;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prefer persistent upload to Supabase Storage
    let finalUrl: string | null = null;
    try {
      const ext = file.name.split('.').pop() || 'png';
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const path = `${campaignId || 'draft'}/${selectedDevice || 'desktop'}/${currentScreen || 'screen1'}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from('campaign-assets')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || `image/${ext}` });
      if (error) throw error;

      const { data: pub } = supabase.storage.from('campaign-assets').getPublicUrl(path);
      finalUrl = pub.publicUrl;
      console.log('✅ [BackgroundPanel] Uploaded to storage:', finalUrl);
    } catch (err) {
      console.warn('⚠️ [BackgroundPanel] Storage upload failed, falling back to base64', err);
      // Fallback to base64 for immediate feedback
      const reader = new FileReader();
      finalUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.readAsDataURL(file);
      });
    }

    if (!finalUrl) return;

    // Apply background with final URL
    onBackgroundChange(
      { type: 'image', value: finalUrl },
      {
        screenId: currentScreen,
        applyToAllScreens: applyToAllScreens,
        device: selectedDevice
      }
    );

    // Sync article mode listeners
    try {
      const evtCurrent = new CustomEvent('applyBackgroundCurrentScreen', {
        detail: { url: finalUrl, screenId: currentScreen, device: selectedDevice }
      });
      window.dispatchEvent(evtCurrent);
      if (applyToAllScreens) {
        const evtAll = new CustomEvent('applyBackgroundAllScreens', {
          detail: { url: finalUrl, device: selectedDevice }
        });
        window.dispatchEvent(evtAll);
      }
    } catch (err) {
      console.warn('⚠️ Failed to dispatch article background sync events:', err);
    }

    // Extract colors from the persisted image URL
    const colors = await extractColorsFromImage(finalUrl);
    if (onExtractedColorsChange && colors.length > 0) {
      onExtractedColorsChange(colors);
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

      {/* Sous-onglets */}
      <div className="flex border-b border-[hsl(var(--sidebar-border))] mb-2">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSubTab === 'style'
              ? 'text-[hsl(var(--sidebar-text-primary))] border-b-2 border-[hsl(var(--sidebar-active))]'
              : 'text-[hsl(var(--sidebar-text))] hover:text-[hsl(var(--sidebar-text-primary))]'
          }`}
          onClick={() => setActiveSubTab('style')}
        >
          Style
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSubTab === 'effects'
              ? 'text-[hsl(var(--sidebar-text-primary))] border-b-2 border-[hsl(var(--sidebar-active))]'
              : 'text-[hsl(var(--sidebar-text))] hover:text-[hsl(var(--sidebar-text-primary))]'
          }`}
          onClick={() => setActiveSubTab('effects')}
        >
          Effets
        </button>
      </div>

      {/* Action rapide: Rotation (curseur) - uniquement dans le sous-onglet Effets */}
      {activeSubTab === 'effects' && (
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5 mb-1">
            <RotateCw className="w-3.5 h-3.5" />
            Rotation
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={-180 * SENSITIVITY}
              max={180 * SENSITIVITY}
              step={1}
              value={uiRotation}
              onChange={(e) => {
                const raw = Number(e.target.value);
                setUiRotation(raw);
                const val = Math.round(raw / SENSITIVITY);
                setRotationDeg(val);
                if (selectedElement && onElementUpdate) {
                  onElementUpdate({ rotation: val });
                }
              }}
              className="flex-1"
              disabled={!selectedElement}
            />
            <div className="w-14 text-right text-xs text-gray-700">{Math.round(rotationDeg)}°</div>
          </div>
        </div>
      )}

      {activeSubTab === 'style' && !isTextSelected && (
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">
            IMAGE DE FOND ({selectedDevice === 'mobile' ? 'MOBILE' : 'DESKTOP/TABLET'})
          </h3>
          <button
            onClick={triggerFileUpload}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white transition-colors flex flex-col items-center group"
          >
            <Upload className="w-6 h-6 mb-2 text-gray-600 group-hover:text-white" />
            <span className="text-sm text-gray-600 group-hover:text-white">
              {selectedDevice === 'mobile' ? 'Télécharger pour Mobile' : 'Télécharger pour Desktop/Tablet'}
            </span>
            <span className="text-xs text-gray-500 group-hover:text-white">PNG, JPG jusqu'à 10MB</span>
          </button>
          <label className="mt-3 flex items-center gap-2 select-none">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={applyToAllScreens}
              onChange={(e) => handleApplyToAllScreensChange(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Appliquer à tous les écrans</span>
          </label>
        </div>
      )}

      {activeSubTab === 'style' && (
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
      )}

      {/* FONT CATEGORIES - seulement en Style et si texte sélectionné */}
      {activeSubTab === 'style' && isTextSelected && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-700">CATÉGORIES DE POLICES</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {availableFontCategories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setSelectedFontCategory(category)}
                className={`p-2 text-xs rounded transition-all duration-200 ${
                  selectedFontCategory.name === category.name
                    ? 'bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">{selectedFontCategory?.name || 'Aucune'}</h4>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {(selectedFontCategory?.fonts || []).map((font) => {
                // Pour BlocTexte, vérifier bodyFontFamily, sinon fontFamily
                const currentFont = selectedElement?.type === 'BlocTexte' 
                  ? selectedElement?.bodyFontFamily 
                  : selectedElement?.fontFamily;
                const isActiveFont = currentFont === font;
                return (
                  <button
                    key={font}
                    type="button"
                    onClick={() => {
                      // Pour BlocTexte, utiliser bodyFontFamily, sinon fontFamily
                      const fontProp = selectedElement?.type === 'BlocTexte' ? 'bodyFontFamily' : 'fontFamily';
                      onElementUpdate?.({ [fontProp]: font });
                    }}
                    className={`p-3 border rounded text-left transition-colors group ${
                      isActiveFont
                        ? 'border-[hsl(var(--primary))] bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white'
                        : 'border-gray-200 hover:border-[hsl(var(--primary))] hover:bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:text-white'
                    }`}
                  >
                    <span style={{ fontFamily: font }} className="text-lg font-medium group-hover:text-white">
                      {font}
                    </span>
                    <span className="block text-[11px] mt-1 text-gray-500 group-hover:text-white/80">
                      {selectedFontCategory.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Effets rapides */}
      {activeSubTab === 'effects' && isTextSelected && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_TEXT_EFFECTS.filter(fx => (fx.category ?? 'style') === 'style').map((effect) => {
              const isActive = effectiveEffectId === effect.id;
              return (
                <React.Fragment key={effect.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentEffectId(effect.id);
                      // Appliquer juste après pour que l'UI affiche le panneau inline immédiatement
                      requestAnimationFrame(() => applyQuickEffect(effect.id));
                    }}
                    className={`w-full p-3 border rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'border-[hsl(var(--primary))] bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] text-white shadow-lg'
                        : 'border-gray-200 bg-white hover:border-[hsl(var(--primary))] hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div className="w-full h-10 flex items-center justify-center rounded" style={effect.style}>
                      <span className="font-medium">Ag</span>
                    </div>
                    <div className="mt-2 text-xs font-medium">{effect.name}</div>
                  </button>

                  {/* Réglages inline pour Ombres */}
                  {isActive && effect.id === 'shadow' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Distance */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Distance</label>
                          <div className="flex items-center gap-3">
                            <input type="range" min={0} max={100} step={1} value={shadowDistance}
                              onChange={(e) => { setShadowDistance(Number(e.target.value)); applyQuickEffect('shadow'); }}
                              className="flex-1" />
                            <div className="w-12 text-right text-xs text-gray-700">{shadowDistance}</div>
                          </div>
                        </div>
                        {/* Angle */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Angle</label>
                          <div className="flex items-center gap-3">
                            <input type="range" min={-180} max={180} step={1} value={shadowAngle}
                              onChange={(e) => { setShadowAngle(Number(e.target.value)); applyQuickEffect('shadow'); }}
                              className="flex-1" />
                            <div className="w-12 text-right text-xs text-gray-700">{shadowAngle}</div>
                          </div>
                        </div>
                        {/* Flou */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Flou</label>
                          <div className="flex items-center gap-3">
                            <input type="range" min={0} max={50} step={1} value={shadowBlur}
                              onChange={(e) => { setShadowBlur(Number(e.target.value)); applyQuickEffect('shadow'); }}
                              className="flex-1" />
                            <div className="w-12 text-right text-xs text-gray-700">{shadowBlur}</div>
                          </div>
                        </div>
                        {/* Transparence */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Transparence</label>
                          <div className="flex items-center gap-3">
                            <input type="range" min={0} max={100} step={1} value={shadowOpacity}
                              onChange={(e) => { setShadowOpacity(Number(e.target.value)); applyQuickEffect('shadow'); }}
                              className="flex-1" />
                            <div className="w-12 text-right text-xs text-gray-700">{shadowOpacity}</div>
                          </div>
                        </div>
                        {/* Couleur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={shadowColor}
                              onChange={(e) => { setShadowColor(e.target.value); applyQuickEffect('shadow'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer" />
                            <input type="text" value={shadowColor}
                              onChange={(e) => { setShadowColor(e.target.value); applyQuickEffect('shadow'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm" placeholder="#000000" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Réglages inline pour Arrière-plan */}
                  {isActive && effect.id === 'background' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Arrondissement des coins */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Arrondissement des coins</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={bgRadius}
                              onChange={(e) => { setBgRadius(Number(e.target.value)); applyQuickEffect('background'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{Math.round((bgRadius/100)*24)}px</div>
                          </div>
                        </div>
                        {/* Écart */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Écart</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={bgGap}
                              onChange={(e) => { setBgGap(Number(e.target.value)); applyQuickEffect('background'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{Math.round((bgGap/100)*24)}px</div>
                          </div>
                        </div>
                        {/* Transparence */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Transparence</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={bgAlpha}
                              onChange={(e) => { setBgAlpha(Number(e.target.value)); applyQuickEffect('background'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{bgAlpha}</div>
                          </div>
                        </div>
                        {/* Couleur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => { setBgColor(e.target.value); applyQuickEffect('background'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bgColor}
                              onChange={(e) => { setBgColor(e.target.value); applyQuickEffect('background'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#FFD700"
                            />
                          </div>
                        </div>
                        {/* Couleur du texte */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur du texte</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bgTextColor}
                              onChange={(e) => { setBgTextColor(e.target.value); applyQuickEffect('background'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bgTextColor}
                              onChange={(e) => { setBgTextColor(e.target.value); applyQuickEffect('background'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#111111"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Réglages inline pour Néon */}
                  {isActive && effect.id === 'neon' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Intensité */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Intensité</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={neonIntensity}
                              onChange={(e) => { setNeonIntensity(Number(e.target.value)); applyQuickEffect('neon'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{neonIntensity}</div>
                          </div>
                        </div>
                        {/* Couleur du néon */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur du néon</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={neonColor}
                              onChange={(e) => { setNeonColor(e.target.value); applyQuickEffect('neon'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={neonColor}
                              onChange={(e) => { setNeonColor(e.target.value); applyQuickEffect('neon'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#ff00e6"
                            />
                          </div>
                        </div>
                        {/* Couleur du texte */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur du texte</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={neonTextColor}
                              onChange={(e) => { setNeonTextColor(e.target.value); applyQuickEffect('neon'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={neonTextColor}
                              onChange={(e) => { setNeonTextColor(e.target.value); applyQuickEffect('neon'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Réglages inline pour Écho */}
                  {isActive && effect.id === 'echo' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Distance */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Distance</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={echoDistance}
                              onChange={(e) => { setEchoDistance(Number(e.target.value)); applyQuickEffect('echo'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{echoDistance}</div>
                          </div>
                        </div>
                        {/* Angle */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Angle</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={-180}
                              max={180}
                              step={1}
                              value={echoAngle}
                              onChange={(e) => { setEchoAngle(Number(e.target.value)); applyQuickEffect('echo'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{echoAngle}</div>
                          </div>
                        </div>
                        {/* Couleur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={echoColor}
                              onChange={(e) => { setEchoColor(e.target.value); applyQuickEffect('echo'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={echoColor}
                              onChange={(e) => { setEchoColor(e.target.value); applyQuickEffect('echo'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Réglages inline pour Bordure (cadre) */}
                  {isActive && effect.id === 'border' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Épaisseur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Épaisseur</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={boxBorderThickness}
                              onChange={(e) => { setBoxBorderThickness(Number(e.target.value)); applyQuickEffect('border'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{Math.round((boxBorderThickness/100)*10)}px</div>
                          </div>
                        </div>
                        {/* Arrondi des coins */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Arrondi des coins</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={boxBorderRadius}
                              onChange={(e) => { setBoxBorderRadius(Number(e.target.value)); applyQuickEffect('border'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{Math.round((boxBorderRadius/100)*24)}px</div>
                          </div>
                        </div>
                        {/* Couleur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={boxBorderColor}
                              onChange={(e) => { setBoxBorderColor(e.target.value); applyQuickEffect('border'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={boxBorderColor}
                              onChange={(e) => { setBoxBorderColor(e.target.value); applyQuickEffect('border'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#111111"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Réglages inline pour Biseautage */}
                  {isActive && effect.id === 'bevel' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Épaisseur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Épaisseur</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={bevelThickness}
                              onChange={(e) => { setBevelThickness(Number(e.target.value)); applyQuickEffect('bevel'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{bevelThickness}</div>
                          </div>
                        </div>
                        {/* Distance */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Distance</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={bevelDistance}
                              onChange={(e) => { setBevelDistance(Number(e.target.value)); applyQuickEffect('bevel'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{bevelDistance}</div>
                          </div>
                        </div>
                        {/* Angle */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Angle</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={-180}
                              max={180}
                              step={1}
                              value={bevelAngle}
                              onChange={(e) => { setBevelAngle(Number(e.target.value)); applyQuickEffect('bevel'); }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{bevelAngle}</div>
                          </div>
                        </div>
                        {/* Couleur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bevelColor}
                              onChange={(e) => { setBevelColor(e.target.value); applyQuickEffect('bevel'); }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bevelColor}
                              onChange={(e) => { setBevelColor(e.target.value); applyQuickEffect('bevel'); }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#808080"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Réglages inline pour Contour */}
                  {isActive && effect.id === 'outline' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Épaisseur */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Épaisseur</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={outlineThickness}
                              onChange={(e) => {
                                setOutlineThickness(Number(e.target.value));
                                applyQuickEffect('outline');
                              }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{outlineThickness}</div>
                          </div>
                        </div>

                        {/* Couleur du contour */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Couleur</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={outlineColor}
                              onChange={(e) => {
                                setOutlineColor(e.target.value);
                                applyQuickEffect('outline');
                              }}
                              className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={outlineColor}
                              onChange={(e) => {
                                setOutlineColor(e.target.value);
                                applyQuickEffect('outline');
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="#111111"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Réglages inline pour Élévation */}
                  {isActive && effect.id === 'elevation' && (
                    <div className="col-span-2 mt-2 p-3 border rounded-lg bg-white">
                      <div className="space-y-4">
                        {/* Intensité */}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Intensité</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={elevationIntensity}
                              onChange={(e) => {
                                setElevationIntensity(Number(e.target.value));
                                applyQuickEffect('elevation');
                              }}
                              className="flex-1"
                            />
                            <div className="w-12 text-right text-xs text-gray-700">{elevationIntensity}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Personnalisation globale supprimée (les contrôles spécifiques s'affichent inline sous la carte active) */}
        </div>
      )}

      {/* Couleurs extraites - sous-onglet Style */}
      {activeSubTab === 'style' && extractedColors.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-3">COULEURS EXTRAITES</h3>
          <div className="grid grid-cols-5 gap-2">
            {extractedColors.map((color, index) => (
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
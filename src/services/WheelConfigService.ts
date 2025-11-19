/**
 * Service centralisé pour gérer les configurations de roue
 * Unifie les sources de données et applique les priorités cohérentes
 */
import type { OptimizedCampaign } from '../components/ModernEditor/types/CampaignTypes';

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  textColor?: string;
  probability?: number;
  isWinning?: boolean;
}

interface WheelModalConfig {
  wheelBorderStyle?: string;
  wheelBorderColor?: string;
  wheelBorderWidth?: number;
  wheelScale?: number;
  wheelShowBulbs?: boolean;
  wheelPosition?: 'left' | 'right' | 'center' | 'centerTop';

}

export interface WheelConfig {
  borderStyle: string;
  borderColor: string;
  borderWidth: number;
  scale: number;
  showBulbs?: boolean;
  position?: 'left' | 'right' | 'center' | 'centerTop';

  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  segments?: WheelSegment[];
  size?: number;
  shouldCropWheel?: boolean;
}

export class WheelConfigService {
  // --- Color utilities: robust parsing to hex (#rrggbb) ---
  private static normalizeHex(hex?: string): string | null {
    if (!hex || typeof hex !== 'string') return null;
    let h = hex.trim().toLowerCase();
    if (!h) return null;
    if (h.startsWith('#')) h = h.slice(1);
    // 3-digit shorthand
    if (/^[0-9a-f]{3}$/i.test(h)) {
      const r = h[0];
      const g = h[1];
      const b = h[2];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    // 6-digit
    if (/^[0-9a-f]{6}$/i.test(h)) {
      return `#${h}`;
    }
    return null;
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const to2 = (v: number) => clamp(v).toString(16).padStart(2, '0');
    return `#${to2(r)}${to2(g)}${to2(b)}`;
  }

  private static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    // h in [0, 360), s and l in [0,1]
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const Hp = ((h % 360) + 360) % 360 / 60;
    const X = C * (1 - Math.abs((Hp % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (0 <= Hp && Hp < 1) { r1 = C; g1 = X; b1 = 0; }
    else if (1 <= Hp && Hp < 2) { r1 = X; g1 = C; b1 = 0; }
    else if (2 <= Hp && Hp < 3) { r1 = 0; g1 = C; b1 = X; }
    else if (3 <= Hp && Hp < 4) { r1 = 0; g1 = X; b1 = C; }
    else if (4 <= Hp && Hp < 5) { r1 = X; g1 = 0; b1 = C; }
    else { r1 = C; g1 = 0; b1 = X; }
    const m = l - C / 2;
    return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
  }

  private static parseToHex(input?: string): string | null {
    if (!input || typeof input !== 'string') return null;
    const c = input.trim().toLowerCase();
    // Try hex
    const asHex = this.normalizeHex(c);
    if (asHex) return asHex;

    // rgb/rgba
    const rgbMatch = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (rgbMatch) {
      const r = parseFloat(rgbMatch[1]);
      const g = parseFloat(rgbMatch[2]);
      const b = parseFloat(rgbMatch[3]);
      return this.rgbToHex(r, g, b);
    }

    // hsl/hsla
    const hslMatch = c.match(/^hsla?\(\s*([\-\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (hslMatch) {
      const h = parseFloat(hslMatch[1]);
      const s = parseFloat(hslMatch[2]) / 100;
      const l = parseFloat(hslMatch[3]) / 100;
      const { r, g, b } = this.hslToRgb(h, s, l);
      return this.rgbToHex(r, g, b);
    }

    return null;
  }

  private static toRGBFromHex(hex: string): { r: number; g: number; b: number } {
    const norm = this.normalizeHex(hex);
    const h = (norm || '#000000').slice(1);
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return { r, g, b };
  }

  private static luminanceFromHex(hex: string): number {
    const { r, g, b } = this.toRGBFromHex(hex);
    const srgb = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  }

  private static isNearWhiteColor(input?: string): boolean {
    if (!input) return false;
    const hex = this.parseToHex(input);
    if (!hex) return false;
    const l = this.luminanceFromHex(hex);
    return l >= 0.9;
  }

  /**
   * Récupère la configuration canonique de la roue
   * Applique les priorités : wheelModalConfig > extractedColors > design > defaults
   */
  static getCanonicalWheelConfig(
    campaign: OptimizedCampaign | null,
    extractedColors: string[] = [],
    wheelModalConfig: WheelModalConfig = {},
    options: { shouldCropWheel?: boolean; device?: string } = {}
  ): WheelConfig {
    const defaults = {
      borderStyle: 'classic',
      borderColor: '#44444d',
      borderWidth: 12,
      scale: 1,
      size: 200,
      showBulbs: false, // Ampoules décochées par défaut
      position: 'center' as const,

    };

    // Priorité 1: Configuration de la modal roue (modifications en cours)
    const modalConfig: Partial<{ borderStyle: string; borderColor: string; borderWidth: number; scale: number; showBulbs: boolean; position: 'left' | 'right' | 'center' | 'centerTop' }> = {
      borderStyle: wheelModalConfig?.wheelBorderStyle,
      borderColor: wheelModalConfig?.wheelBorderColor,
      borderWidth: wheelModalConfig?.wheelBorderWidth,
      scale: wheelModalConfig?.wheelScale,
      showBulbs: wheelModalConfig?.wheelShowBulbs,
      position: wheelModalConfig?.wheelPosition
    };

    // Priorité 2: Configuration de design existante + anciens emplacements (robustesse BDD)
    const designConfig: Partial<{ borderStyle: string; borderColor: string; borderWidth: number; scale: number; showBulbs: boolean; position?: 'left' | 'right' | 'center' | 'centerTop' }> = {
      borderStyle: campaign?.design?.wheelBorderStyle || campaign?.design?.wheelConfig?.borderStyle,
      borderColor: campaign?.design?.wheelConfig?.borderColor,
      borderWidth: campaign?.design?.wheelConfig?.borderWidth,
      scale: campaign?.design?.wheelConfig?.scale,
      showBulbs: (campaign?.design?.wheelConfig as any)?.showBulbs,
      // 🔁 Position: supporter tous les anciens emplacements possibles (design, wheelConfig, game_config.wheel, config.roulette)
      position:
        (campaign as any)?.design?.wheelConfig?.position ??
        (campaign as any)?.wheelConfig?.position ??
        (campaign as any)?.game_config?.wheel?.position ??
        (campaign as any)?.config?.roulette?.position,
 
    };

    // Déterminer si une image de fond est utilisée (le type de background peut varier)
    const bg: any = campaign?.design?.background as any;
    const hasImageBackground = typeof bg === 'object' && bg?.type === 'image';

    // Couleur primaire : extraite de l'image si disponible, sinon couleur de la bordure
    // Ajout d'une garde: si la couleur extraite est trop proche du blanc, fallback à la couleur de bordure (ou défaut)
    const extractedPrimaryHex = hasImageBackground && extractedColors[0]
      ? (WheelConfigService.parseToHex(extractedColors[0]) || '')
      : '';
    const borderFallbackHex = WheelConfigService.parseToHex(
      modalConfig.borderColor || designConfig.borderColor || defaults.borderColor
    ) || '#44444d';
    const primaryColor = extractedPrimaryHex && WheelConfigService.isNearWhiteColor(extractedPrimaryHex)
      ? borderFallbackHex
      : (extractedPrimaryHex || borderFallbackHex);

    // Fusion avec priorités
    const finalConfig: WheelConfig = {
      borderStyle: modalConfig.borderStyle || designConfig.borderStyle || defaults.borderStyle,
      borderColor: primaryColor,
      borderWidth: modalConfig.borderWidth !== undefined ? modalConfig.borderWidth : (designConfig.borderWidth || defaults.borderWidth),
      scale: modalConfig.scale !== undefined ? modalConfig.scale : (designConfig.scale || defaults.scale),
      showBulbs: modalConfig.showBulbs !== undefined ? modalConfig.showBulbs : (designConfig.showBulbs ?? defaults.showBulbs),
      position: modalConfig.position !== undefined ? modalConfig.position : (designConfig.position ?? defaults.position),

      shouldCropWheel: options.shouldCropWheel ?? true,

      // Configuration des couleurs avec priorités
      customColors: {
        primary: primaryColor,
        // Forcer un schéma strict à 2 couleurs: primaire + blanc
        secondary: '#ffffff',
        accent: extractedColors[2] || '#45b7d1'
      },

      brandColors: {
        primary: primaryColor,
        secondary: '#ffffff',
        accent: campaign?.design?.brandColors?.accent || '#45b7d1'
      },

      // Segments provenant de la campagne avec couleurs mises à jour
      // PRIORITÉ CORRIGÉE: game_config.wheelSegments (BDD) > gameConfig.wheelSegments (store) > autres sources
      segments: WheelConfigService.updateSegmentColors(
        (campaign as any)?.game_config?.wheelSegments
          || (campaign as any)?.gameConfig?.wheelSegments
          || (campaign as any)?.game_config?.wheel?.segments
          || (campaign as any)?.gameConfig?.wheel?.segments
          || (campaign as any)?.wheelConfig?.segments
          || (campaign as any)?.config?.roulette?.segments,
        extractedColors
      ),

      // Taille responsive
      size: this.getResponsiveSize(options.device, modalConfig.scale || designConfig.scale || defaults.scale)
    };

    try {
      const outSegs = (finalConfig as any)?.segments || [];
      const outSegIds = Array.isArray(outSegs) ? outSegs.map((s: any) => s?.id ?? '?') : [];
      const outSegLabels = Array.isArray(outSegs) ? outSegs.map((s: any) => s?.label ?? '?') : [];
      console.log('🔧 WheelConfigService - Configuration canonique:', {
        input: { campaign: campaign?.id, extractedColors, wheelModalConfig, options },
        segmentSources: {
          gameConfigWheelSegments: (campaign as any)?.gameConfig?.wheelSegments?.length || 0,
          wheelConfigSegments: (campaign as any)?.wheelConfig?.segments?.length || 0,
          gameConfigWheelSegments2: (campaign as any)?.gameConfig?.wheel?.segments?.length || 0,
          configRouletteSegments: (campaign as any)?.config?.roulette?.segments?.length || 0,
        },
        output: {
          ...finalConfig,
          segmentsCount: Array.isArray(outSegs) ? outSegs.length : 0,
          segmentIds: outSegIds,
          segmentLabels: outSegLabels,
          segmentColors: Array.isArray(outSegs) ? outSegs.map((s: any) => s?.color) : []
        }
      });
    } catch (e) {
      console.warn('🔧 WheelConfigService - log error', e);
    }

    return finalConfig;
  }

  /**
   * Calcule la taille de roue responsive
   */
  private static getResponsiveSize(device: string = 'desktop', scale: number = 1): number {
    const baseSize = (() => {
      switch (device) {
        case 'desktop': return 200;
        case 'tablet': return 180;
        case 'mobile': return 140;
        default: return 200;
      }
    })();
    
    return Math.round(baseSize * scale);
  }

  /**
   * Génère les segments standardisés pour l'aperçu
   */
  static getStandardizedSegments(config: WheelConfig): WheelSegment[] {
    const primaryColor = config.customColors?.primary || config.brandColors?.primary || '#ff6b6b';
    const fallbackSecondary = config.customColors?.secondary || config.brandColors?.secondary || '#ffffff';

    // Normalize to hex using robust parser
    const normPrimary = WheelConfigService.parseToHex(primaryColor) || '#ff6b6b';
    let secondaryColor = WheelConfigService.parseToHex(fallbackSecondary) || '#ffffff';
    if (secondaryColor === normPrimary) {
      secondaryColor = '#ffffff';
    }

    // Choix de la couleur de texte lisible (noir/blanc) selon luminance
    const getReadableTextColor = (bgHex: string) => (WheelConfigService.luminanceFromHex(bgHex) > 0.5 ? '#000000' : '#ffffff');

    // Si le nombre de segments est impair, ajouter un "spacer" neutre pour obtenir un compte pair
    let cfgSegments = (config.segments || []) as WheelSegment[];
    if (cfgSegments.length % 2 === 1) {
      try {
        console.warn('🎯 WheelConfigService - Nombre impair de segments détecté. Ajout d\'un segment neutre pour garantir l\'alternance parfaite.');
      } catch {}
      cfgSegments = [
        ...cfgSegments,
        // Segment neutre (les couleurs seront calculées ci-dessous, label vide, non gagnant)
        { id: 'auto-spacer', label: '', isWinning: false } as unknown as WheelSegment
      ];
    }
    if (cfgSegments.length > 0) {
      const out = cfgSegments.map((seg, idx) => {
        // 1) Si une couleur de segment est définie, la respecter
        let bg: string | undefined;
        if (seg.color) {
          const parsed = WheelConfigService.parseToHex(seg.color);
          bg = parsed || seg.color;
        }

        // 2) Sinon, fallback sur l'alternance primaire / secondaire
        if (!bg) {
          bg = idx % 2 === 0 ? normPrimary : secondaryColor;
        }

        // Conserver les champs additionnels (ex: prizeId, image, etc.) pour la logique de gain
        return {
          ...(seg as any),
          id: seg.id ?? String(idx + 1),
          label: seg.label ?? `Item ${idx + 1}`,
          color: bg,
          textColor: getReadableTextColor(bg),
          probability: seg.probability,
          isWinning: seg.isWinning
        } as any;
      });
      try {
        const inCount = (config.segments || []).length;
        const padded = inCount % 2 === 1;
        const ids = out.map((s) => s.id);
        console.log('🧩 WheelConfigService.getStandardizedSegments', { inCount, padded, outCount: out.length, ids });
      } catch {}
      return out;
    }

    // Sinon, fallback démo avec alternance stricte
    const demo = [
      { id: '1', label: '10€' },
      { id: '2', label: '20€' },
      { id: '3', label: '5€' },
      { id: '4', label: 'Perdu' },
      { id: '5', label: '50€' },
      { id: '6', label: '30€' }
    ];
    return demo.map((s, idx) => {
      const bg = idx % 2 === 0 ? normPrimary : secondaryColor;
      return { id: s.id, label: s.label, color: bg, textColor: getReadableTextColor(bg) } as WheelSegment;
    });
  }

  /**
   * Récupère les styles de découpage pour la roue
   */
  static getWheelCroppingStyles(
    shouldCrop: boolean = true,
    position: 'center' | 'left' | 'right' | 'centerTop' = 'center',
    device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
  ) {
    console.log('🎯 [WheelConfigService] getWheelCroppingStyles INPUT:', { shouldCrop, position, device });
    
    if (!shouldCrop) {
      const result = {
        containerClass: 'flex justify-center items-center z-40',
        wheelClass: '',
        transform: ''
      };
      console.log('🎯 [WheelConfigService] getWheelCroppingStyles OUTPUT (no crop):', result);
      return result;
    }

    // 🔒 RÈGLE: Sur mobile et tablet, seules les positions "center" et "centerTop" sont autorisées
    // Si une position "left" ou "right" est demandée sur mobile/tablet, on force "center"
    const effectivePosition = (device === 'mobile' || device === 'tablet') && (position === 'left' || position === 'right') 
      ? 'center' 
      : position;
    
    console.log('🎯 [WheelConfigService] Effective position:', { 
      requested: position, 
      device, 
      effective: effectivePosition 
    });

    // Cas 1: Position "center" ou non définie => découpage centré (ancienne logique)
    if (effectivePosition === 'center' || effectivePosition === undefined) {
      const base = 'absolute bottom-0 transform translate-y-1/3 overflow-hidden pointer-events-none';
      const centerClass = 'left-1/2 -translate-x-1/2';
      const result = {
        containerClass: `${base} ${centerClass} z-40`,
        wheelClass: 'cursor-pointer pointer-events-auto transition-all duration-200 hover:brightness-105',
        transform: 'translate-y-1/3',
        styles: {
          paddingBottom: '-30%'
        }
      };
      console.log('🎯 [WheelConfigService] getWheelCroppingStyles OUTPUT (center):', result);
      return result;
    }

    // Cas 2: Position "centerTop" => roue centrée verticalement et horizontalement (pleine hauteur visible)
    if (effectivePosition === 'centerTop') {
      const base = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      const result = {
        containerClass: `${base} z-40`,
        wheelClass: 'cursor-pointer pointer-events-auto transition-all duration-200 hover:brightness-105',
        transform: '-translate-y-1/2',
        styles: {}
      };
      console.log('🎯 [WheelConfigService] getWheelCroppingStyles OUTPUT (centerTop):', result);
      return result;
    }

    // Cas 3: Desktop + (left|right) => visible entièrement et centré verticalement
    const base = 'absolute top-1/2 transform -translate-y-1/2';
    const positionClass = effectivePosition === 'left' ? 'left-0' : 'right-0';
    const insetStyles = effectivePosition === 'left' ? { left: '150px' } : { right: '150px' };
    const result = {
      containerClass: `${base} ${positionClass} z-40`,
      wheelClass: 'cursor-pointer pointer-events-auto transition-all duration-200 hover:brightness-105',
      transform: '-translate-y-1/2',
      styles: insetStyles
    };
    console.log(`🎯 [WheelConfigService] getWheelCroppingStyles OUTPUT (${effectivePosition}):`, result);
    return result;
  }

  /**
   * Synchronise les changements de configuration
   */
  static createConfigUpdateHandler(
    setCampaign: (updater: OptimizedCampaign | null | ((prev: OptimizedCampaign | null) => OptimizedCampaign | null)) => void,
    setWheelModalConfig: (config: WheelModalConfig | ((prev: WheelModalConfig) => WheelModalConfig)) => void
  ) {
    return (updates: Partial<WheelConfig>) => {
      console.log('🔧 [WheelConfigService] createConfigUpdateHandler called with updates:', updates);
      
      // Mettre à jour la configuration de la modal
      setWheelModalConfig((prev) => {
        const newConfig: WheelModalConfig = { ...prev };
        
        // Mettre à jour seulement les propriétés définies
        if (updates.borderStyle !== undefined) {
          newConfig.wheelBorderStyle = updates.borderStyle;
        }
        if (updates.borderColor !== undefined) {
          newConfig.wheelBorderColor = updates.borderColor;
        }
        if (updates.borderWidth !== undefined) {
          newConfig.wheelBorderWidth = updates.borderWidth;
        }
        if (updates.scale !== undefined) {
          newConfig.wheelScale = updates.scale;
        }
        if (updates.showBulbs !== undefined) {
          newConfig.wheelShowBulbs = updates.showBulbs;
        }
        if (updates.position !== undefined) {
          newConfig.wheelPosition = updates.position as 'left' | 'right' | 'center' | 'centerTop';
        }

        return newConfig;
      });

      // Mettre à jour la campagne avec _lastUpdate pour trigger useEffect
      setCampaign((prevCampaign) => prevCampaign ? ({
        ...prevCampaign,
        design: {
          ...prevCampaign.design,
          wheelBorderStyle: updates.borderStyle !== undefined ? updates.borderStyle : prevCampaign.design?.wheelBorderStyle,
          wheelConfig: {
            ...prevCampaign.design?.wheelConfig,
            borderColor: updates.borderColor !== undefined ? updates.borderColor : prevCampaign.design?.wheelConfig?.borderColor,
            borderWidth: updates.borderWidth !== undefined ? updates.borderWidth : prevCampaign.design?.wheelConfig?.borderWidth,
            scale: updates.scale !== undefined ? updates.scale : prevCampaign.design?.wheelConfig?.scale,
            showBulbs: updates.showBulbs !== undefined ? updates.showBulbs : (prevCampaign.design?.wheelConfig as any)?.showBulbs,
            position: updates.position !== undefined ? updates.position : (prevCampaign.design?.wheelConfig as any)?.position,
          }
        },
        // Mirror minimal config vers campaign.wheelConfig pour une meilleure persistance BDD
        wheelConfig: {
          ...(prevCampaign as any).wheelConfig,
          borderStyle: updates.borderStyle !== undefined ? updates.borderStyle : (prevCampaign as any).wheelConfig?.borderStyle,
          borderColor: updates.borderColor !== undefined ? updates.borderColor : (prevCampaign as any).wheelConfig?.borderColor,
          borderWidth: updates.borderWidth !== undefined ? updates.borderWidth : (prevCampaign as any).wheelConfig?.borderWidth,
          scale: updates.scale !== undefined ? updates.scale : (prevCampaign as any).wheelConfig?.scale,
          showBulbs: updates.showBulbs !== undefined ? updates.showBulbs : (prevCampaign as any).wheelConfig?.showBulbs,
          position: updates.position !== undefined ? updates.position : (prevCampaign as any).wheelConfig?.position,
        },
        _lastUpdate: Date.now() // Force reactivity in useWheelConfigSync
      }) : null);
    };
  }

  /**
   * Met à jour les couleurs des segments avec les couleurs extraites
   */
  static updateSegmentColors(segments: any[], extractedColors: string[] = []): any[] {
    if (!segments || !Array.isArray(segments)) {
      return [];
    }
    
    if (extractedColors.length === 0) {
      return segments;
    }

    const primaryColor = extractedColors[0];
    
    const updatedSegments = segments.map((segment, index) => {
      // Mettre à jour uniquement les segments avec la couleur par défaut violette
      if (segment.color === '#44444d') {
        return { ...segment, color: primaryColor };
      }
      return segment;
    });
    
    return updatedSegments;
  }
}
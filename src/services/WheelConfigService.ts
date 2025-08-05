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
  wheelScale?: number;
}

export interface WheelConfig {
  borderStyle: string;
  borderColor: string;
  scale: number;
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
      borderColor: '#841b60',
      scale: 1,
      size: 200
    };

    // Priorité 1: Configuration de la modal roue (modifications en cours)
    const modalConfig = {
      borderStyle: wheelModalConfig?.wheelBorderStyle,
      borderColor: wheelModalConfig?.wheelBorderColor,
      scale: wheelModalConfig?.wheelScale
    };

    // Priorité 2: Configuration de design existante
    const designConfig = {
      borderStyle: campaign?.design?.wheelBorderStyle || campaign?.design?.wheelConfig?.borderStyle,
      borderColor: campaign?.design?.wheelConfig?.borderColor,
      scale: campaign?.design?.wheelConfig?.scale
    };

    // Priorité 3: Couleurs extraites (uniquement si style classic et pas de couleur manuelle)
    const extractedConfig = extractedColors.length > 0 && designConfig.borderStyle === 'classic' ? {
      borderColor: modalConfig.borderColor || designConfig.borderColor || extractedColors[0]
    } : {};

    // Fusion avec priorités
    const finalConfig: WheelConfig = {
      borderStyle: modalConfig.borderStyle || designConfig.borderStyle || defaults.borderStyle,
      borderColor: modalConfig.borderColor || designConfig.borderColor || extractedConfig.borderColor || defaults.borderColor,
      scale: modalConfig.scale !== undefined ? modalConfig.scale : (designConfig.scale || defaults.scale),
      shouldCropWheel: options.shouldCropWheel ?? true,
      
      // Configuration des couleurs avec priorités
      customColors: {
        primary: modalConfig.borderColor || designConfig.borderColor || extractedColors[0] || defaults.borderColor,
        secondary: extractedColors[1] || '#4ecdc4',
        accent: extractedColors[2] || '#45b7d1'
      },
      
      brandColors: {
        primary: modalConfig.borderColor || designConfig.borderColor || extractedColors[0] || defaults.borderColor,
        secondary: campaign?.design?.brandColors?.secondary || '#4ecdc4',
        accent: campaign?.design?.brandColors?.accent || '#45b7d1'
      },

      // Taille responsive
      size: this.getResponsiveSize(options.device, modalConfig.scale || designConfig.scale || defaults.scale)
    };

    console.log('🔧 WheelConfigService - Configuration canonique:', {
      input: { campaign: campaign?.id, extractedColors, wheelModalConfig, options },
      output: finalConfig
    });

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
    const whiteColor = '#ffffff';
    
    return [
      { id: '1', label: '10€', color: primaryColor, textColor: whiteColor },
      { id: '2', label: '20€', color: whiteColor, textColor: primaryColor },
      { id: '3', label: '5€', color: primaryColor, textColor: whiteColor },
      { id: '4', label: 'Perdu', color: whiteColor, textColor: primaryColor },
      { id: '5', label: '50€', color: primaryColor, textColor: whiteColor },
      { id: '6', label: '30€', color: whiteColor, textColor: primaryColor }
    ];
  }

  /**
   * Récupère les styles de découpage pour la roue
   */
  static getWheelCroppingStyles(shouldCrop: boolean = true) {
    if (!shouldCrop) {
      return {
        containerClass: 'flex justify-center items-center',
        wheelClass: '',
        transform: ''
      };
    }

    return {
      containerClass: 'absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/3 overflow-hidden',
      wheelClass: 'cursor-pointer hover:scale-105 transition-transform duration-200',
      transform: 'translate-y-1/3',
      styles: {
        paddingBottom: '-30%'
      }
    };
  }

  /**
   * Synchronise les changements de configuration
   */
  static createConfigUpdateHandler(
    setCampaign: (updater: OptimizedCampaign | null | ((prev: OptimizedCampaign | null) => OptimizedCampaign | null)) => void,
    setWheelModalConfig: (config: WheelModalConfig | ((prev: WheelModalConfig) => WheelModalConfig)) => void
  ) {
    return (updates: Partial<WheelConfig>) => {
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
        if (updates.scale !== undefined) {
          newConfig.wheelScale = updates.scale;
        }
        
        return newConfig;
      });

      // Mettre à jour la campagne
      setCampaign((prevCampaign) => prevCampaign ? ({
        ...prevCampaign,
        design: {
          ...prevCampaign.design,
          wheelBorderStyle: updates.borderStyle !== undefined ? updates.borderStyle : prevCampaign.design?.wheelBorderStyle,
          wheelConfig: {
            ...prevCampaign.design?.wheelConfig,
            borderColor: updates.borderColor !== undefined ? updates.borderColor : prevCampaign.design?.wheelConfig?.borderColor,
            scale: updates.scale !== undefined ? updates.scale : prevCampaign.design?.wheelConfig?.scale
          }
        }
      }) : null);
    };
  }
}
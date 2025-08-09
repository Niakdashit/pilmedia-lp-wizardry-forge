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
  wheelPosition?: 'left' | 'right' | 'center';

}

export interface WheelConfig {
  borderStyle: string;
  borderColor: string;
  borderWidth: number;
  scale: number;
  showBulbs?: boolean;
  position?: 'left' | 'right' | 'center';

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
      borderWidth: 12,
      scale: 1,
      size: 200,
      showBulbs: false,
      position: 'center' as const,

    };

    // Priorité 1: Configuration de la modal roue (modifications en cours)
    const modalConfig: Partial<{ borderStyle: string; borderColor: string; borderWidth: number; scale: number; showBulbs: boolean; position: 'left' | 'right' | 'center' }> = {
      borderStyle: wheelModalConfig?.wheelBorderStyle,
      borderColor: wheelModalConfig?.wheelBorderColor,
      borderWidth: wheelModalConfig?.wheelBorderWidth,
      scale: wheelModalConfig?.wheelScale,
      showBulbs: wheelModalConfig?.wheelShowBulbs,
      position: wheelModalConfig?.wheelPosition
    };

    // Priorité 2: Configuration de design existante
    const designConfig: Partial<{ borderStyle: string; borderColor: string; borderWidth: number; scale: number; showBulbs: boolean; position?: 'left' | 'right' | 'center' }> = {
      borderStyle: campaign?.design?.wheelBorderStyle || campaign?.design?.wheelConfig?.borderStyle,
      borderColor: campaign?.design?.wheelConfig?.borderColor,
      borderWidth: campaign?.design?.wheelConfig?.borderWidth,
      scale: campaign?.design?.wheelConfig?.scale,
      showBulbs: (campaign?.design?.wheelConfig as any)?.showBulbs,
      position: (campaign?.design?.wheelConfig as any)?.position,
 
    };

    // Déterminer si une image de fond est utilisée
    const hasImageBackground = campaign?.design?.background?.type === 'image';

    // Couleur primaire : extraite de l'image si disponible, sinon couleur de la bordure
    const primaryColor = hasImageBackground && extractedColors[0]
      ? extractedColors[0]
      : (modalConfig.borderColor || designConfig.borderColor || defaults.borderColor);

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
        secondary: '#ffffff',
        accent: extractedColors[2] || '#45b7d1'
      },

      brandColors: {
        primary: primaryColor,
        secondary: '#ffffff',
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
  static getWheelCroppingStyles(
    shouldCrop: boolean = true,
    position: 'center' | 'left' | 'right' = 'center',
    device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
  ) {
    if (!shouldCrop) {
      return {
        containerClass: 'flex justify-center items-center',
        wheelClass: '',
        transform: ''
      };
    }

    // Cas 1: Position "center" => conserver l'ancien découpage (croppé en bas) pour tous les devices
    if (position === 'center' || device !== 'desktop') {
      const base = 'absolute bottom-0 transform translate-y-1/3 overflow-hidden';
      const centerClass = 'left-1/2 -translate-x-1/2';
      return {
        containerClass: `${base} ${centerClass}`,
        wheelClass: 'cursor-pointer hover:scale-105 transition-transform duration-200',
        transform: 'translate-y-1/3',
        styles: {
          paddingBottom: '-30%'
        }
      };
    }

    // Cas 2: Desktop + (left|right) => visible entièrement et centré verticalement
    const base = 'absolute top-1/2 transform -translate-y-1/2';
    const positionClass = position === 'left' ? 'left-0' : 'right-0';
    const insetStyles = position === 'left' ? { left: '50px' } : { right: '50px' };
    return {
      containerClass: `${base} ${positionClass}`,
      wheelClass: 'cursor-pointer hover:scale-105 transition-transform duration-200',
      transform: '-translate-y-1/2',
      styles: insetStyles
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
          newConfig.wheelPosition = updates.position as 'left' | 'right' | 'center';
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
            borderWidth: updates.borderWidth !== undefined ? updates.borderWidth : prevCampaign.design?.wheelConfig?.borderWidth,
            scale: updates.scale !== undefined ? updates.scale : prevCampaign.design?.wheelConfig?.scale,
            showBulbs: updates.showBulbs !== undefined ? updates.showBulbs : (prevCampaign.design?.wheelConfig as any)?.showBulbs,
            position: updates.position !== undefined ? updates.position : (prevCampaign.design?.wheelConfig as any)?.position,

          }
        }
      }) : null);
    };
  }
}
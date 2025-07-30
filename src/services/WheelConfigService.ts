/**
 * Service centralisé pour gérer les configurations de roue
 * Unifie les sources de données et applique les priorités cohérentes
 */

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
  segments?: any[];
  size?: number;
  shouldCropWheel?: boolean;
}

export class WheelConfigService {
  /**
   * Récupère la configuration canonique de la roue
   * Applique les priorités : wheelModalConfig > extractedColors > design > defaults
   */
  static getCanonicalWheelConfig(
    campaign: any,
    extractedColors: string[] = [],
    wheelModalConfig: any = {},
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
      scale: modalConfig.scale || designConfig.scale || defaults.scale,
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
  static getStandardizedSegments(config: WheelConfig): any[] {
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
      containerClass: 'absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3/5',
      wheelClass: 'cursor-pointer hover:scale-105 transition-transform duration-200',
      transform: 'translate-y-3/5',
      styles: {
        paddingBottom: '-30%'
      }
    };
  }

  /**
   * Synchronise les changements de configuration
   */
  static createConfigUpdateHandler(
    setCampaign: (updater: any) => void,
    setWheelModalConfig: (config: any) => void
  ) {
    return (updates: Partial<WheelConfig>) => {
      // Mettre à jour la configuration de la modal
      setWheelModalConfig((prev: any) => ({
        ...prev,
        wheelBorderStyle: updates.borderStyle,
        wheelBorderColor: updates.borderColor,
        wheelScale: updates.scale
      }));

      // Mettre à jour la campagne
      setCampaign((prevCampaign: any) => ({
        ...prevCampaign,
        design: {
          ...prevCampaign?.design,
          wheelBorderStyle: updates.borderStyle,
          wheelConfig: {
            ...prevCampaign?.design?.wheelConfig,
            borderColor: updates.borderColor,
            scale: updates.scale
          }
        }
      }));
    };
  }
}
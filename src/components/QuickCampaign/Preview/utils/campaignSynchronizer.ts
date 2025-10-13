
import { applyBrandStyleToWheel, BrandColors } from '../../../../utils/BrandStyleAnalyzer';

interface CustomColors {
  primary: string;
  secondary: string;
  accent?: string;
}

export const synchronizeCampaignWithColors = (
  mockCampaign: any,
  finalColors: CustomColors,
  logoUrl?: string
) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Synchronisation de la campagne avec les couleurs:', finalColors);
  }
  
  // Spread all existing properties from mockCampaign
  const synchronizedCampaign = {
    ...mockCampaign,
    // Apply brand style while preserving existing structure
    ...applyBrandStyleToWheel(mockCampaign, finalColors as BrandColors)
  };
  
  // Application forcée des couleurs exactes à la configuration de la roue
  if (synchronizedCampaign.config?.roulette) {
    synchronizedCampaign.config.roulette = {
      ...synchronizedCampaign.config.roulette,
      // Ne pas écraser les couleurs de bordure si un style prédéfini est utilisé
      ...(synchronizedCampaign.design?.wheelBorderStyle === 'classic' && {
        borderColor: finalColors.primary,
        borderOutlineColor: finalColors.accent || finalColors.secondary,
      }),
      segmentColor1: finalColors.primary,
      segmentColor2: finalColors.secondary,
      // Forcer la mise à jour des segments avec les couleurs exactes
      segments: synchronizedCampaign.config.roulette.segments?.map((segment: any, index: number) => ({
        ...segment,
        color: index % 2 === 0 ? finalColors.primary : finalColors.secondary
      })) || []
    };
  }

  // Ensure design object exists and merge properties properly
  synchronizedCampaign.design = {
    ...synchronizedCampaign.design,
    // Only set centerLogo if it exists in the original design type
    ...(logoUrl && { centerLogo: logoUrl }),
    customColors: finalColors,
    // Preserve wheelBorderStyle if it exists
    ...(synchronizedCampaign.design?.wheelBorderStyle && {
      wheelBorderStyle: synchronizedCampaign.design.wheelBorderStyle
    })
  };

  // Ensure gameConfig exists for compatibility
  if (!synchronizedCampaign.gameConfig) {
    synchronizedCampaign.gameConfig = {};
  }

  // Mise à jour de la configuration du bouton
  synchronizedCampaign.buttonConfig = {
    ...synchronizedCampaign.buttonConfig,
    color: finalColors.accent || finalColors.primary,
    borderColor: finalColors.primary,
    textColor: finalColors.primary
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('Campagne synchronisée avec couleurs exactes:', synchronizedCampaign);
  }
  return synchronizedCampaign;
};

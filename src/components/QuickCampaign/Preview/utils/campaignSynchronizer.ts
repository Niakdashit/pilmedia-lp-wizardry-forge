
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
  console.log('Synchronisation de la campagne avec les couleurs:', finalColors);
  
  const campaign = applyBrandStyleToWheel(mockCampaign, finalColors as BrandColors);
  
  // Application forcée des couleurs exactes à la configuration de la roue
  if (campaign.config?.roulette) {
    campaign.config.roulette = {
      ...campaign.config.roulette,
      borderColor: finalColors.primary,
      borderOutlineColor: finalColors.accent || finalColors.secondary,
      segmentColor1: finalColors.primary,
      segmentColor2: finalColors.secondary,
      // Forcer la mise à jour des segments avec les couleurs exactes
      segments: campaign.config.roulette.segments?.map((segment: any, index: number) => ({
        ...segment,
        color: index % 2 === 0 ? finalColors.primary : finalColors.secondary
      })) || []
    };
  }

  // Application forcée des couleurs au design
  campaign.design = {
    ...campaign.design,
    centerLogo: logoUrl || campaign.design?.centerLogo,
    customColors: finalColors
  };

  // Mise à jour de la configuration du bouton
  campaign.buttonConfig = {
    ...campaign.buttonConfig,
    color: finalColors.accent || finalColors.primary,
    borderColor: finalColors.primary,
    textColor: finalColors.primary
  };

  console.log('Campagne synchronisée avec couleurs exactes:', campaign);
  return campaign;
};

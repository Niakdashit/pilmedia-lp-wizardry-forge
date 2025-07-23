
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

  // Création automatique des éléments texte et logo pour l'affichage
  const customTexts = campaign.design?.customTexts || [];
  const customImages = campaign.design?.customImages || [];

  // Ajouter le titre automatiquement s'il n'existe pas déjà
  if (campaign.title && !customTexts.find((text: any) => text.id === 'auto-title')) {
    customTexts.push({
      id: 'auto-title',
      text: campaign.title,
      x: 50,
      y: 50,
      size: '4xl',
      color: finalColors.primary,
      fontFamily: 'Inter, sans-serif',
      bold: true,
      enabled: true,
      desktop: { x: 50, y: 50, size: '4xl' },
      tablet: { x: 40, y: 40, size: '3xl' },
      mobile: { x: 30, y: 30, size: '2xl' }
    });
  }

  // Ajouter la description automatiquement s'elle n'existe pas déjà
  if (campaign.description && !customTexts.find((text: any) => text.id === 'auto-description')) {
    customTexts.push({
      id: 'auto-description',
      text: campaign.description,
      x: 50,
      y: 120,
      size: 'lg',
      color: '#333333',
      fontFamily: 'Inter, sans-serif',
      enabled: true,
      desktop: { x: 50, y: 120, size: 'lg' },
      tablet: { x: 40, y: 100, size: 'base' },
      mobile: { x: 30, y: 80, size: 'sm' }
    });
  }

  // Ajouter le logo automatiquement s'il n'existe pas déjà
  if (logoUrl && !customImages.find((img: any) => img.id === 'auto-logo')) {
    customImages.push({
      id: 'auto-logo',
      src: logoUrl,
      x: 20,
      y: 20,
      width: 80,
      height: 80,
      enabled: true,
      desktop: { x: 20, y: 20, width: 80, height: 80 },
      tablet: { x: 15, y: 15, width: 60, height: 60 },
      mobile: { x: 10, y: 10, width: 50, height: 50 }
    });
  }

  campaign.design = {
    ...campaign.design,
    customTexts,
    customImages
  };

  // Mise à jour de la configuration du bouton
  campaign.buttonConfig = {
    ...campaign.buttonConfig,
    color: finalColors.accent || finalColors.primary,
    borderColor: finalColors.primary,
    textColor: finalColors.primary
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('Campagne synchronisée avec couleurs exactes et éléments automatiques:', campaign);
  }
  return campaign;
};

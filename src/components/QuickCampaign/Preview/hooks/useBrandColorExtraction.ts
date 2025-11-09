import React from 'react';
import { generateBrandThemeFromUrl } from '../../../../utils/BrandStyleAnalyzer';
import { getExactBrandColors } from '../utils/exactColorExtractor';

interface CustomColors {
  primary: string;
  secondary: string;
  accent?: string;
}

export const useBrandColorExtraction = (
  customColors: CustomColors,
  siteUrl?: string
) => {
  const [siteColors, setSiteColors] = React.useState<string[]>([]);
  const [finalColors, setFinalColors] = React.useState(customColors);
  const [brandStyleExtracted, setBrandStyleExtracted] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);

  // Extraction automatique des couleurs avec le nouveau système
  React.useEffect(() => {
    const extractBrandTheme = async () => {
      if (!siteUrl) {
        setFinalColors(customColors);
        return;
      }

      setIsExtracting(true);
      
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('🚀 Démarrage extraction thème de marque pour:', siteUrl);
        }
        
        // Priorité ABSOLUE: Couleurs exactes prédéfinies
        const exactColors = getExactBrandColors(siteUrl);
        if (exactColors) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('🎯 Application couleurs exactes:', exactColors);
          }
          setFinalColors(exactColors);
          setBrandStyleExtracted(true);
          return;
        }

        // Nouveau système : generateBrandThemeFromUrl
        const brandTheme = await generateBrandThemeFromUrl(siteUrl);
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Thème de marque généré:', brandTheme);
        }
        
        // Application des couleurs extraites
        setFinalColors({
          primary: brandTheme.customColors.primary,
          secondary: brandTheme.customColors.secondary,
          accent: brandTheme.customColors.accent
        });
        
        setBrandStyleExtracted(true);
        
        // Mise à jour des états pour compatibilité
        setSiteColors([
          brandTheme.customColors.primary,
          brandTheme.customColors.secondary,
          brandTheme.customColors.accent
        ]);
        
      } catch (error) {
        console.error('❌ Erreur extraction thème:', error);
        
        // Fallback vers couleurs personnalisées
        if (customColors.primary && !isGenericColor(customColors.primary)) {
          setFinalColors(customColors);
        } else {
          // Palette d'urgence
          setFinalColors({
            primary: '#44444d',
            secondary: '#dc2626',
            accent: '#10b981'
          });
        }
        
        setBrandStyleExtracted(false);
      } finally {
        setIsExtracting(false);
      }
    };

    extractBrandTheme();
  }, [siteUrl, customColors]);

  // Fallback si pas de site URL
  React.useEffect(() => {
    if (!siteUrl && !isExtracting) {
      setFinalColors(customColors);
    }
  }, [customColors, siteUrl, isExtracting]);

  return {
    finalColors,
    siteColors,
    brandStyleExtracted,
    isExtracting
  };
};

// Helper pour détecter les couleurs génériques
const isGenericColor = (color: string): boolean => {
  const genericColors = ['#44444d', '#3B82F6', '#8b5cf6', '#6b7280', '#374151'];
  return genericColors.includes(color);
};

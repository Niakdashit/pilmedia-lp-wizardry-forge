
import { useState, useCallback } from 'react';
import { generateBrandThemeFromFile } from '../../../../utils/BrandStyleAnalyzer';
import { getExactBrandColors } from '../../Preview/utils/exactColorExtractor';

interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
}

export const useBrandExtraction = () => {
  const [extractedColors, setExtractedColors] = useState<ExtractedColors | null>(null);
  const [extractedFont, setExtractedFont] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractBrandFromLogo = useCallback(async (logoFile: File) => {
    setIsExtracting(true);
    setError(null);
    
    try {
      // Créer une URL temporaire pour vérifier les couleurs exactes
      const logoUrl = URL.createObjectURL(logoFile);
      
      // Vérifier d'abord les couleurs exactes prédéfinies
      const exactColors = getExactBrandColors(logoUrl);
      if (exactColors) {
        setExtractedColors({
          primary: exactColors.primary,
          secondary: exactColors.secondary,
          accent: exactColors.accent || '#ffffff'
        });
        setExtractedFont('Inter, sans-serif'); // Police par défaut
        return;
      }

      // Sinon, utiliser l'extraction automatique
      const brandTheme = await generateBrandThemeFromFile(logoFile);
      
      setExtractedColors({
        primary: brandTheme.customColors.primary,
        secondary: brandTheme.customColors.secondary,
        accent: brandTheme.customColors.accent
      });

      // TODO: Intégrer extraction de police plus sophistiquée
      // Pour l'instant, on utilise une police par défaut basée sur le style détecté
      const detectedFont = detectFontStyle(brandTheme.customColors.primary);
      setExtractedFont(detectedFont);

      // Nettoyer l'URL temporaire
      URL.revokeObjectURL(logoUrl);

    } catch (err) {
      console.error('Erreur extraction marque:', err);
      setError('Impossible d\'extraire les informations de la marque');
      
      // Couleurs de fallback
      setExtractedColors({
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#ffffff'
      });
      setExtractedFont('Inter, sans-serif');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // Fonction pour détecter un style de police basé sur les couleurs
  const detectFontStyle = (primaryColor: string): string => {
    // Logique simplifiée pour suggérer une police
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    if (luminance < 0.3) {
      // Couleurs sombres -> polices élégantes
      return 'Playfair Display, serif';
    } else if (luminance > 0.7) {
      // Couleurs claires -> polices modernes
      return 'Poppins, sans-serif';
    } else {
      // Couleurs moyennes -> polices équilibrées
      return 'Inter, sans-serif';
    }
  };

  return {
    extractedColors,
    extractedFont,
    isExtracting,
    error,
    extractBrandFromLogo
  };
};

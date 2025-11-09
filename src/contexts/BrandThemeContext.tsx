import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BrandTheme } from '../utils/BrandStyleAnalyzer';
// import { getExactBrandColors } from '../components/QuickCampaign/Preview/utils/exactColorExtractor';

interface BrandThemeContextValue {
  theme: BrandTheme | null;
  isLoading: boolean;
  error: string | null;
  applyThemeFromUrl: (url: string) => Promise<void>;
  applyThemeFromFile: (file: File) => Promise<void>;
  resetTheme: () => void;
}

const BrandThemeContext = createContext<BrandThemeContextValue | null>(null);

interface BrandThemeProviderProps {
  children: React.ReactNode;
  defaultUrl?: string;
}

const BrandThemeProvider: React.FC<BrandThemeProviderProps> = ({ 
  children, 
  defaultUrl 
}) => {
  const [theme, setTheme] = useState<BrandTheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyThemeFromUrl = async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      // Couleurs par défaut - fonction supprimée
      // const exactColors = getExactBrandColors(url);
      // Continuer avec l'extraction BrandStyleAnalyzer

      // Extraction via BrandStyleAnalyzer (dynamic import to avoid dual import warning)
      const { generateBrandThemeFromUrl } = await import('../utils/BrandStyleAnalyzer');
      const brandTheme = await generateBrandThemeFromUrl(url);
      setTheme(brandTheme);
      
      // Appliquer les variables CSS globales
      applyThemeToCSS(brandTheme);
      
    } catch (err) {
      console.error('Erreur extraction thème:', err);
      setError('Erreur lors de l\'extraction du thème de marque');
      
      // Thème de fallback
      const fallbackTheme = {
        customColors: {
          primary: '#44444d',
          secondary: '#dc2626',
          accent: '#ffffff',
          text: '#ffffff'
        }
      };
      setTheme(fallbackTheme);
      applyThemeToCSS(fallbackTheme);
      
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeFromFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const { generateBrandThemeFromFile } = await import('../utils/BrandStyleAnalyzer');
      const brandTheme = await generateBrandThemeFromFile(file);
      setTheme(brandTheme);
      applyThemeToCSS(brandTheme);
    } catch (err) {
      console.error('Erreur extraction thème fichier:', err);
      setError('Erreur lors de l\'extraction du thème depuis le fichier');
    } finally {
      setIsLoading(false);
    }
  };

  const resetTheme = () => {
    setTheme(null);
    setError(null);
    // Reset des variables CSS
    const root = document.documentElement;
    root.style.removeProperty('--brand-primary');
    root.style.removeProperty('--brand-secondary');
    root.style.removeProperty('--brand-accent');
    root.style.removeProperty('--brand-text');
  };

  const applyThemeToCSS = (brandTheme: BrandTheme) => {
    const root = document.documentElement;
    
    // Convertir les couleurs en format HSL pour cohérence
    const convertToHSL = (hex: string) => {
      // Simple conversion hex vers HSL approximative
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    try {
      root.style.setProperty('--brand-primary', convertToHSL(brandTheme.customColors.primary));
      root.style.setProperty('--brand-secondary', convertToHSL(brandTheme.customColors.secondary));
      root.style.setProperty('--brand-accent', convertToHSL(brandTheme.customColors.accent));
      root.style.setProperty('--brand-text', convertToHSL(brandTheme.customColors.text));
      
      // Synchroniser avec les variables primary/secondary
      root.style.setProperty('--primary', convertToHSL(brandTheme.customColors.primary));
      root.style.setProperty('--secondary', convertToHSL(brandTheme.customColors.secondary));
    } catch (error) {
      console.error('Erreur lors de l\'application du thème CSS:', error);
      // Fallback avec couleurs par défaut
      root.style.setProperty('--brand-primary', '309 78% 31%');
      root.style.setProperty('--brand-secondary', '0 74% 50%');
      root.style.setProperty('--brand-accent', '0 0% 100%');
      root.style.setProperty('--brand-text', '0 0% 100%');
    }
  };

  useEffect(() => {
    if (defaultUrl) {
      applyThemeFromUrl(defaultUrl);
    }
  }, [defaultUrl]);

  const value: BrandThemeContextValue = {
    theme,
    isLoading,
    error,
    applyThemeFromUrl,
    applyThemeFromFile,
    resetTheme
  };

  return (
    <BrandThemeContext.Provider value={value}>
      {children}
    </BrandThemeContext.Provider>
  );
};

export { BrandThemeProvider };

export const useBrandTheme = () => {
  const context = useContext(BrandThemeContext);
  if (!context) {
    throw new Error('useBrandTheme must be used within a BrandThemeProvider');
  }
  return context;
};
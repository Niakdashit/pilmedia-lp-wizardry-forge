import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateBrandThemeFromUrl, BrandTheme } from '../utils/BrandStyleAnalyzer';
import { getExactBrandColors } from '../components/QuickCampaign/Preview/utils/exactColorExtractor';

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

export const BrandThemeProvider: React.FC<BrandThemeProviderProps> = ({ 
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
      // Priorité absolue : couleurs exactes prédéfinies
      const exactColors = getExactBrandColors(url);
      if (exactColors) {
        setTheme({
          customColors: {
            primary: exactColors.primary,
            secondary: exactColors.secondary,
            accent: exactColors.accent || '#ffffff',
            text: '#ffffff'
          },
          logoUrl: undefined
        });
        return;
      }

      // Extraction via BrandStyleAnalyzer
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
          primary: '#841b60',
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
    root.style.setProperty('--brand-primary', brandTheme.customColors.primary);
    root.style.setProperty('--brand-secondary', brandTheme.customColors.secondary);
    root.style.setProperty('--brand-accent', brandTheme.customColors.accent);
    root.style.setProperty('--brand-text', brandTheme.customColors.text);
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

export const useBrandTheme = () => {
  const context = useContext(BrandThemeContext);
  if (!context) {
    throw new Error('useBrandTheme must be used within a BrandThemeProvider');
  }
  return context;
};

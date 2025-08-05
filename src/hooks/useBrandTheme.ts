
import { useBrandTheme as useContext } from '../contexts/BrandThemeContext';

// Hook global simplifié pour l'utilisation dans les composants
export const useBrandTheme = () => {
  const context = useContext();
  
  return {
    // Couleurs de marque
    primaryColor: context.theme?.customColors.primary || 'hsl(328 75% 31%)',
    secondaryColor: context.theme?.customColors.secondary || 'hsl(328 75% 40%)',
    accentColor: context.theme?.customColors.accent || '#ffffff',
    textColor: context.theme?.customColors.text || '#ffffff',
    
    // Logo
    logoUrl: context.theme?.logoUrl,
    
    // États
    isLoading: context.isLoading,
    error: context.error,
    hasTheme: !!context.theme,
    
    // Actions
    applyFromUrl: context.applyThemeFromUrl,
    applyFromFile: context.applyThemeFromFile,
    reset: context.resetTheme,
    
    // Utilitaires pour les styles inline
    getButtonStyle: (variant: 'primary' | 'secondary' = 'primary') => ({
      background: variant === 'primary' 
        ? context.theme?.customColors.primary ? `linear-gradient(135deg, ${context.theme.customColors.primary}, ${context.theme.customColors.secondary || '#b41b60'})` : 'linear-gradient(135deg, hsl(328 75% 31%), hsl(328 75% 40%))'
        : context.theme?.customColors.secondary || 'hsl(328 75% 40%)',
      color: context.theme?.customColors.text || '#ffffff',
      borderColor: context.theme?.customColors.primary || 'hsl(328 75% 31%)'
    }),
    
    getBorderStyle: () => ({
      borderColor: context.theme?.customColors.primary || 'hsl(328 75% 31%)'
    }),
    
    getTextStyle: (variant: 'primary' | 'secondary' = 'primary') => ({
      color: variant === 'primary'
        ? context.theme?.customColors.primary || 'hsl(328 75% 31%)'
        : context.theme?.customColors.secondary || 'hsl(328 75% 40%)'
    }),
    
    // Classes Tailwind dynamiques avec dégradé
    primaryBg: context.theme?.customColors.primary ? `bg-[${context.theme.customColors.primary}]` : 'bg-brand-gradient',
    primaryText: context.theme?.customColors.primary ? `text-[${context.theme.customColors.primary}]` : 'text-brand',
    primaryBorder: context.theme?.customColors.primary ? `border-[${context.theme.customColors.primary}]` : 'border-brand',
    secondaryBg: context.theme?.customColors.secondary ? `bg-[${context.theme.customColors.secondary}]` : 'bg-brand-secondary',
    secondaryText: context.theme?.customColors.secondary ? `text-[${context.theme.customColors.secondary}]` : 'text-brand-secondary'
  };
};

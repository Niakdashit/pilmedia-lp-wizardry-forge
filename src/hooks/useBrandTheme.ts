
import { useBrandTheme as useContext } from '../contexts/BrandThemeContext';

// Hook global simplifié pour l'utilisation dans les composants
export const useBrandTheme = () => {
  const context = useContext();
  
  return {
    // Couleurs de marque
    primaryColor: context.theme?.customColors.primary || '#841b60',
    secondaryColor: context.theme?.customColors.secondary || '#dc2626',
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
      backgroundColor: variant === 'primary' 
        ? context.theme?.customColors.primary || '#841b60'
        : context.theme?.customColors.secondary || '#dc2626',
      color: context.theme?.customColors.text || '#ffffff',
      borderColor: context.theme?.customColors.primary || '#841b60'
    }),
    
    getBorderStyle: () => ({
      borderColor: context.theme?.customColors.primary || '#841b60'
    }),
    
    getTextStyle: (variant: 'primary' | 'secondary' = 'primary') => ({
      color: variant === 'primary'
        ? context.theme?.customColors.primary || '#841b60'
        : context.theme?.customColors.secondary || '#dc2626'
    }),
    
    // Classes Tailwind dynamiques
    primaryBg: `bg-[${context.theme?.customColors.primary || '#841b60'}]`,
    primaryText: `text-[${context.theme?.customColors.primary || '#841b60'}]`,
    primaryBorder: `border-[${context.theme?.customColors.primary || '#841b60'}]`,
    secondaryBg: `bg-[${context.theme?.customColors.secondary || '#dc2626'}]`,
    secondaryText: `text-[${context.theme?.customColors.secondary || '#dc2626'}]`
  };
};

import { useMemo } from 'react';

export interface ScreenLayout {
  align?: 'top' | 'center' | 'bottom';
  justify?: 'left' | 'center' | 'right';
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

/**
 * Hook pour convertir la configuration de layout d'écran en styles CSS
 * Utilisé pour synchroniser le positionnement entre l'éditeur et le preview
 */
export const useScreenLayout = (layout?: ScreenLayout) => {
  return useMemo(() => {
    if (!layout) {
      // Par défaut: centré verticalement et horizontalement
      return {
        display: 'flex',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        width: '100%',
        height: '100%'
      };
    }

    // Convertir align en alignItems CSS
    const alignItems =
      layout.align === 'top'
        ? ('flex-start' as const)
        : layout.align === 'bottom'
        ? ('flex-end' as const)
        : ('center' as const);

    // Convertir justify en justifyContent CSS
    const justifyContent =
      layout.justify === 'left'
        ? ('flex-start' as const)
        : layout.justify === 'right'
        ? ('flex-end' as const)
        : ('center' as const);

    // Gérer le padding (uniforme ou par côté)
    const padding = layout.padding !== undefined ? layout.padding : undefined;
    const paddingTop = layout.paddingTop !== undefined ? layout.paddingTop : padding;
    const paddingBottom = layout.paddingBottom !== undefined ? layout.paddingBottom : padding;
    const paddingLeft = layout.paddingLeft !== undefined ? layout.paddingLeft : padding;
    const paddingRight = layout.paddingRight !== undefined ? layout.paddingRight : padding;

    return {
      display: 'flex',
      alignItems,
      justifyContent,
      width: '100%',
      height: '100%',
      ...(paddingTop !== undefined && { paddingTop: `${paddingTop}px` }),
      ...(paddingBottom !== undefined && { paddingBottom: `${paddingBottom}px` }),
      ...(paddingLeft !== undefined && { paddingLeft: `${paddingLeft}px` }),
      ...(paddingRight !== undefined && { paddingRight: `${paddingRight}px` })
    };
  }, [layout]);
};

/**
 * Fonction helper pour obtenir le layout depuis la configuration de campagne
 */
export const getLayoutFromCampaign = (campaign: any): ScreenLayout | undefined => {
  // Chercher dans différents endroits possibles
  const layout = 
    campaign?.design?.layout ||
    campaign?.design?.quizConfig?.layout ||
    campaign?.layout ||
    undefined;

  return layout;
};

import React, { CSSProperties } from 'react';

export interface ScreenLayoutConfig {
  align?: 'top' | 'center' | 'bottom';
  justify?: 'left' | 'center' | 'right';
  padding?: string | number;
  paddingTop?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
}

interface ScreenLayoutWrapperProps {
  children: React.ReactNode;
  layout?: ScreenLayoutConfig;
  className?: string;
  style?: CSSProperties;
}

/**
 * ScreenLayoutWrapper - Composant réutilisable pour centrer et positionner le contenu
 * selon la configuration de layout de l'écran actif.
 * 
 * Utilisé pour garantir que le quiz (ou tout autre contenu) soit parfaitement centré
 * verticalement et horizontalement, ou positionné selon la configuration.
 */
export const ScreenLayoutWrapper: React.FC<ScreenLayoutWrapperProps> = ({ 
  children, 
  layout = {},
  className = '',
  style = {}
}) => {
  // Convertir align en justifyContent (pour l'axe vertical avec flexDirection: column)
  // Par défaut: centré, mais permet "top" et "bottom" si explicitement configurés
  const justifyContent =
    layout.align === 'top'
      ? 'flex-start'
      : layout.align === 'bottom'
      ? 'flex-end'
      : 'center';

  // Convertir justify en alignItems (pour l'axe horizontal avec flexDirection: column)
  const alignItems =
    layout.justify === 'left'
      ? 'flex-start'
      : layout.justify === 'right'
      ? 'flex-end'
      : 'center';

  // Gérer le padding
  const padding = layout.padding || '0px';
  const paddingTop = layout.paddingTop || padding;
  const paddingBottom = layout.paddingBottom || padding;
  const paddingLeft = layout.paddingLeft || padding;
  const paddingRight = layout.paddingRight || padding;

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent,
    alignItems,
    // Utiliser 100% pour se caler sur la hauteur réelle de l'écran simulé,
    // plutôt que 100vh qui utilise toute la fenêtre et fausse le centrage.
    height: '100%',
    width: '100%',
    position: 'relative',
    paddingTop: typeof paddingTop === 'number' ? `${paddingTop}px` : paddingTop,
    paddingBottom: typeof paddingBottom === 'number' ? `${paddingBottom}px` : paddingBottom,
    paddingLeft: typeof paddingLeft === 'number' ? `${paddingLeft}px` : paddingLeft,
    paddingRight: typeof paddingRight === 'number' ? `${paddingRight}px` : paddingRight,
    ...style
  };

  return (
    <div className={`screen-layout-wrapper ${className}`} style={wrapperStyle}>
      {children}
    </div>
  );
};

/**
 * Hook pour extraire la configuration de layout depuis une campagne
 */
export const useLayoutFromCampaign = (campaign: any): ScreenLayoutConfig => {
  if (!campaign) return {};
  
  return (
    campaign?.design?.layout ||
    campaign?.design?.quizConfig?.layout ||
    campaign?.layout ||
    {}
  );
};

export default ScreenLayoutWrapper;

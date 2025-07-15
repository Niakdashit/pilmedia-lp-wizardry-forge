
import React from 'react';

interface MobileButtonProps {
  mobileConfig: any;
  campaign: any;
}

const getButtonAbsoluteStyle = (mobileConfig: any) => {
  const buttonPlacement = mobileConfig.buttonPlacement || 'bottom';
  const horizontalPadding = Math.max(12, mobileConfig.horizontalPadding ?? 16);
  const gamePosition = mobileConfig.gamePosition || 'center';
  const gameVerticalOffset = mobileConfig.gameVerticalOffset || 0;
  const gameHorizontalOffset = mobileConfig.gameHorizontalOffset || 0;
  
  // Fonction pour déterminer la position optimale du bouton
  const getOptimalButtonPosition = () => {
    // Priorité 1: Position verticale - Si la roue dépasse 5% vers le bas
    if (gameVerticalOffset > 5) {
      return 'top';
    }
    
    // Priorité 2: Position horizontale extrême (±50%)
    if (gameHorizontalOffset >= 50) {
      return 'left'; // Roue à droite, bouton à gauche
    }
    
    if (gameHorizontalOffset <= -50) {
      return 'right'; // Roue à gauche, bouton à droite
    }
    
    // Priorité 3: Position de base selon la position prédéfinie de la roue
    switch (gamePosition) {
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        // Si aucune condition spéciale, garder la position configurée
        return buttonPlacement;
    }
  };
  
  const optimalPlacement = getOptimalButtonPosition();
  
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto' as const
  };

  switch (optimalPlacement) {
    case 'top':
      return {
        ...baseStyle,
        top: '20px',
        left: horizontalPadding,
        right: horizontalPadding
      };
    case 'bottom':
      return {
        ...baseStyle,
        bottom: '20px',
        left: horizontalPadding,
        right: horizontalPadding
      };
    case 'left':
      return {
        ...baseStyle,
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'auto'
      };
    case 'right':
      return {
        ...baseStyle,
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'auto'
      };
    case 'center':
      return {
        ...baseStyle,
        top: '50%',
        left: horizontalPadding,
        right: horizontalPadding,
        transform: 'translateY(-50%)'
      };
    default:
      return {
        ...baseStyle,
        bottom: '20px',
        left: horizontalPadding,
        right: horizontalPadding
      };
  }
};

const getButtonStyle = (mobileConfig: any, isLateralPosition = false) => {
  const buttonSize = mobileConfig.buttonSize || 'medium';
  const buttonWidth = mobileConfig.buttonWidth || 80;
  
  const sizeConfig = {
    small: { padding: '6px 12px', fontSize: '0.8rem' },
    medium: { padding: '8px 16px', fontSize: '0.9rem' },
    large: { padding: '12px 24px', fontSize: '1rem' }
  };

  return {
    backgroundColor: mobileConfig.buttonColor || '#841b60',
    color: mobileConfig.buttonTextColor || '#ffffff',
    borderRadius: mobileConfig.buttonShape === 'rounded-full' ? '9999px' : 
                 mobileConfig.buttonShape === 'rounded-md' ? '6px' : '8px',
    padding: sizeConfig[buttonSize as keyof typeof sizeConfig]?.padding || sizeConfig.medium.padding,
    fontSize: sizeConfig[buttonSize as keyof typeof sizeConfig]?.fontSize || sizeConfig.medium.fontSize,
    boxShadow: mobileConfig.buttonShadow === 'none' ? 'none' :
              mobileConfig.buttonShadow === 'shadow-lg' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' :
              '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    // Pour les positions latérales, utiliser une largeur fixe au lieu d'un pourcentage
    width: isLateralPosition ? 'auto' : `${buttonWidth}%`,
    maxWidth: isLateralPosition ? '120px' : '100%',
    minWidth: isLateralPosition ? '80px' : '100px',
    whiteSpace: 'normal' as const,
    wordWrap: 'break-word' as const,
    lineHeight: 1.4,
    textAlign: 'center' as const,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    minHeight: '40px',
    wordBreak: 'break-word' as const,
    hyphens: 'auto' as const
  };
};

const MobileButton: React.FC<MobileButtonProps> = ({ mobileConfig, campaign }) => {
  const gameVerticalOffset = mobileConfig.gameVerticalOffset || 0;
  const gameHorizontalOffset = mobileConfig.gameHorizontalOffset || 0;
  const gamePosition = mobileConfig.gamePosition || 'center';
  
  // Déterminer si c'est une position latérale
  const isLateralPosition = () => {
    // Vérifier les conditions de repositionnement horizontal
    if (gameHorizontalOffset >= 50 || gameHorizontalOffset <= -50) {
      return true;
    }
    
    // Vérifier les positions prédéfinies latérales
    if ((gamePosition === 'left' || gamePosition === 'right') && Math.abs(gameVerticalOffset) <= 5) {
      return true;
    }
    
    return false;
  };
  
  return (
    <div style={getButtonAbsoluteStyle(mobileConfig)}>
      <button
        className="transition-colors"
        style={getButtonStyle(mobileConfig, isLateralPosition())}
      >
        {mobileConfig.buttonText || campaign.gameConfig?.[campaign.type]?.buttonLabel || 'Lancer'}
      </button>
    </div>
  );
};

export default MobileButton;

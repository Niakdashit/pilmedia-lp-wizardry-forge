
import React from 'react';

interface MobileButtonProps {
  mobileConfig: any;
  campaign: any;
}

const getButtonAbsoluteStyle = (mobileConfig: any) => {
  const buttonPlacement = mobileConfig.buttonPlacement || 'bottom';
  const horizontalPadding = Math.max(12, mobileConfig.horizontalPadding ?? 16);
  
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 100,
    left: horizontalPadding,
    right: horizontalPadding,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto' as const
  };

  switch (buttonPlacement) {
    case 'top':
      return {
        ...baseStyle,
        top: '20px'
      };
    case 'center':
      return {
        ...baseStyle,
        top: '50%',
        transform: 'translateY(-50%)'
      };
    case 'bottom':
    default:
      return {
        ...baseStyle,
        bottom: '20px'
      };
  }
};

const getButtonStyle = (mobileConfig: any) => {
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
    width: `${buttonWidth}%`,
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    wordWrap: 'break-word' as const,
    lineHeight: 1.4,
    textAlign: 'center' as const,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    minHeight: '40px',
    minWidth: '100px',
    wordBreak: 'break-word' as const,
    hyphens: 'auto' as const
  };
};

const MobileButton: React.FC<MobileButtonProps> = ({ mobileConfig, campaign }) => {
  return (
    <div style={getButtonAbsoluteStyle(mobileConfig)}>
      <button
        className="transition-colors"
        style={getButtonStyle(mobileConfig)}
      >
        {mobileConfig.buttonText || campaign.gameConfig?.[campaign.type]?.buttonLabel || 'Lancer'}
      </button>
    </div>
  );
};

export default MobileButton;

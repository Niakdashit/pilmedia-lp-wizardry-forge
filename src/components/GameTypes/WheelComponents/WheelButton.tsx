
import React from 'react';
import { getAccessibleTextColor } from '../../../utils/BrandStyleAnalyzer';
import { useButtonStyleCSS } from '@/stores/buttonStore';

interface ButtonConfig {
  color: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  size: 'small' | 'medium' | 'large';
  text: string;
  visible: boolean;
  textColor?: string;
}

interface WheelButtonProps {
  buttonConfig: ButtonConfig;
  spinning: boolean;
  disabled: boolean;
  formValidated: boolean;
  onClick: () => void;
}

const WheelButton: React.FC<WheelButtonProps> = ({
  buttonConfig,
  spinning,
  disabled,
  formValidated,
  onClick
}) => {
  // Style global des boutons (synchronisé avec le mode Article)
  const globalButtonStyle = useButtonStyleCSS();
        return 'px-4 py-2 text-sm';
    }
  };

  if (!buttonConfig.visible) return null;

  // Utiliser la couleur de texte automatique si elle n'est pas définie
  const textColor = buttonConfig.textColor || getAccessibleTextColor(buttonConfig.color);

  return (
    <button 
      onClick={onClick} 
      disabled={spinning || disabled} 
      style={{
        // Style global unifié (fond, texte, bordure, arrondi, zoom, etc.)
        ...globalButtonStyle,
        // Uniformiser la couleur de texte calculée si différente
        color: textColor,
        width: '100%',
      }} 
      className={`w-full px-6 py-3 font-medium transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {spinning ? 'Tourne...' : formValidated ? 'Lancer la roue' : buttonConfig.text || 'Remplir le formulaire'}
    </button>
  );
};

export default WheelButton;

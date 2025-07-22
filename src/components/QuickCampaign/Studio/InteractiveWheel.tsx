import React from 'react';
import { SmartWheel } from '../../SmartWheel';

interface InteractiveWheelProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onSpin?: () => void;
}

const InteractiveWheel: React.FC<InteractiveWheelProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
  onSpin
}) => {
  const segments = [
    { id: '1', label: '10% OFF', color: primaryColor, textColor: '#ffffff' },
    { id: '2', label: '20% OFF', color: secondaryColor, textColor: '#ffffff' },
    { id: '3', label: 'CADEAU', color: accentColor, textColor: '#ffffff' },
    { id: '4', label: '5% OFF', color: primaryColor, textColor: '#ffffff' },
    { id: '5', label: 'ESSAI GRATUIT', color: secondaryColor, textColor: '#ffffff' },
    { id: '6', label: '15% OFF', color: accentColor, textColor: '#ffffff' },
    { id: '7', label: 'BONUS', color: primaryColor, textColor: '#ffffff' },
    { id: '8', label: '30% OFF', color: secondaryColor, textColor: '#ffffff' }
  ];

  // Configuration des couleurs de marque
  const brandColors = {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor
  };

  return (
    <SmartWheel
      segments={segments}
      theme="modern"
      size={240}
      gamePosition={{ x: 0, y: 0, scale: 1.7 }}
      brandColors={brandColors}
      onSpin={onSpin}
      borderStyle="classic"
      customButton={{
        text: 'TOURNER',
        color: primaryColor,
        textColor: '#ffffff'
      }}
    />
  );
};

export default InteractiveWheel;
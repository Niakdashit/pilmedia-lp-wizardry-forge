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
    { id: '1', label: 'Gain', color: primaryColor, textColor: '#ffffff' },
    { id: '2', label: 'Dommage', color: secondaryColor, textColor: primaryColor },
    { id: '3', label: 'Gain', color: primaryColor, textColor: '#ffffff' },
    { id: '4', label: 'Dommage', color: secondaryColor, textColor: primaryColor },
    { id: '5', label: 'Gain', color: primaryColor, textColor: '#ffffff' },
    { id: '6', label: 'Dommage', color: secondaryColor, textColor: primaryColor }
  ];

  const brandColors = {
    primary: primaryColor,
    secondary: '#ffffff',
    accent: accentColor
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <SmartWheel
        segments={segments}
        theme="modern"
        size={280}
        brandColors={brandColors}
        onSpin={onSpin}
        onResult={() => {}}
        disablePointerAnimation={true}
        buttonPosition="center"
        customButton={{
          text: 'GO',
          color: primaryColor,
          textColor: '#ffffff'
        }}
        showBulbs={true}
      />
    </div>
  );
};

export default InteractiveWheel;
